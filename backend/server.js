const express = require("express");
const cors = require("cors");
require("dotenv").config();

const db = require("./db");
const authRoutes = require("./routes/auth");

const app = express();

app.use(cors());
app.use(express.json());

app.use("/api/auth", authRoutes);


/* =====================================================
   TEST ROUTE
===================================================== */

app.get("/", (req, res) => {
    res.json({
        message: "Service Marketplace Backend is running!"
    });
});


/* =====================================================
   DATABASE TEST ROUTE
===================================================== */

app.get("/api/test-db", async (req, res) => {
    try {

        const [rows] = await db.query(
            "SELECT 1 AS connected"
        );

        res.json({
            success: true,
            message: "MySQL Connected Successfully",
            data: rows
        });

    } catch (error) {

        console.error(error);

        res.status(500).json({
            success: false,
            message: "Database connection failed",
            error: error.message
        });

    }
});


/* =====================================================
   GET ALL CATEGORIES
===================================================== */

app.get("/api/categories", async (req, res) => {
    try {

        const [categories] = await db.query(
            "SELECT * FROM categories ORDER BY name"
        );

        res.json({
            success: true,
            categories
        });

    } catch (error) {

        console.error(error);

        res.status(500).json({
            success: false,
            message: "Failed to fetch categories",
            error: error.message
        });

    }
});


/* =====================================================
   GET ALL PROVIDERS
===================================================== */

app.get("/api/providers", async (req, res) => {
    try {

        const [providers] = await db.query(`
            SELECT
                p.id,
                p.user_id,
                p.business_name,
                p.description,
                p.location,
                p.experience,
                p.hourly_rate,
                p.rating,
                p.total_reviews,
                c.name AS category_name,
                u.name AS provider_name,
                u.email
            FROM providers p
            JOIN users u
                ON p.user_id = u.id
            LEFT JOIN categories c
                ON p.category_id = c.id
            ORDER BY p.id DESC
        `);


        /* Get services and availability */

        for (const provider of providers) {

            /* Provider services */

            const [services] = await db.query(`
                SELECT
                    id,
                    name,
                    description,
                    price,
                    duration
                FROM services
                WHERE provider_id = ?
                ORDER BY id ASC
            `, [provider.id]);

            provider.services = services;


            /* Provider availability */

            const [availability] = await db.query(`
                SELECT
                    day_of_week,
                    start_time,
                    end_time
                FROM availability
                WHERE provider_id = ?
                ORDER BY FIELD(
                    day_of_week,
                    'Monday',
                    'Tuesday',
                    'Wednesday',
                    'Thursday',
                    'Friday',
                    'Saturday',
                    'Sunday'
                )
            `, [provider.id]);


            provider.availability = {};


            availability.forEach(slot => {

                const startHour = parseInt(slot.start_time);
                const endHour = parseInt(slot.end_time);

                const times = [];


                for (
                    let hour = startHour;
                    hour < endHour;
                    hour++
                ) {

                    const period =
                        hour >= 12 ? "PM" : "AM";

                    const displayHour =
                        hour > 12 ? hour - 12 : hour;

                    times.push(
                        `${displayHour}:00 ${period}`
                    );

                }


                provider.availability[
                    slot.day_of_week
                ] = times;

            });

        }


        res.json({
            success: true,
            providers
        });

    } catch (error) {

        console.error(error);

        res.status(500).json({
            success: false,
            message: "Failed to fetch providers",
            error: error.message
        });

    }
});


/* =====================================================
   CREATE BOOKING
===================================================== */

app.post("/api/bookings", async (req, res) => {

    try {

        const {
            customer_id,
            provider_id,
            service_id,
            booking_date,
            start_time,
            end_time = null,
            address = null,
            notes = null
        } = req.body;


        if (
            !customer_id ||
            !provider_id ||
            !service_id ||
            !booking_date ||
            !start_time
        ) {

            return res.status(400).json({
                success: false,
                message:
                    "Customer, provider, service, date and start time are required"
            });

        }


        const [result] = await db.query(
            `
            INSERT INTO bookings
            (
                customer_id,
                provider_id,
                service_id,
                booking_date,
                start_time,
                end_time,
                address,
                notes
            )
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
            `,
            [
                customer_id,
                provider_id,
                service_id,
                booking_date,
                start_time,
                end_time,
                address,
                notes
            ]
        );


        res.status(201).json({
            success: true,
            message: "Booking created successfully",
            booking_id: result.insertId
        });


    } catch (error) {

        console.error("Booking error:", error);

        res.status(500).json({
            success: false,
            message: "Failed to create booking",
            error: error.message
        });

    }

});


/* =====================================================
   GET ALL BOOKINGS
===================================================== */

app.get("/api/bookings", async (req, res) => {

    try {

        const [bookings] = await db.query(`
            SELECT
                b.id,
                b.customer_id,
                b.provider_id,
                b.service_id,
                b.booking_date,
                b.start_time,
                b.end_time,
                b.address,
                b.notes,
                b.status,
                b.created_at,

                u.name AS customer_name,

                p.business_name,

                pu.name AS provider_name,

                s.name AS service_name,

                s.price

            FROM bookings b

            JOIN users u
                ON b.customer_id = u.id

            JOIN providers p
                ON b.provider_id = p.id

            JOIN users pu
                ON p.user_id = pu.id

            JOIN services s
                ON b.service_id = s.id

            ORDER BY b.id DESC
        `);


        res.json({
            success: true,
            bookings
        });


    } catch (error) {

        console.error("Get bookings error:", error);

        res.status(500).json({
            success: false,
            message: "Failed to fetch bookings",
            error: error.message
        });

    }

});


/* =====================================================
   UPDATE BOOKING STATUS
===================================================== */

app.put("/api/bookings/:id/status", async (req, res) => {

    try {

        const { id } = req.params;

        const { status } = req.body;


        const allowedStatuses = [
            "Requested",
            "Confirmed",
            "In Progress",
            "Completed",
            "Cancelled"
        ];


        if (!allowedStatuses.includes(status)) {

            return res.status(400).json({
                success: false,
                message: "Invalid booking status"
            });

        }


        const [result] = await db.query(
            `
            UPDATE bookings
            SET status = ?
            WHERE id = ?
            `,
            [status, id]
        );


        if (result.affectedRows === 0) {

            return res.status(404).json({
                success: false,
                message: "Booking not found"
            });

        }


        res.json({
            success: true,
            message: "Booking status updated successfully"
        });


    } catch (error) {

        console.error(
            "Update booking status error:",
            error
        );


        res.status(500).json({
            success: false,
            message: "Failed to update booking status",
            error: error.message
        });

    }

});

/* =====================================================
   SUBMIT REVIEW
===================================================== */

app.post("/api/reviews", async (req, res) => {

    try {

        const {
            booking_id,
            customer_id,
            provider_id,
            rating,
            comment
        } = req.body;


        if (
            !booking_id ||
            !customer_id ||
            !provider_id ||
            !rating
        ) {

            return res.status(400).json({
                success: false,
                message:
                    "Booking, customer, provider and rating are required"
            });

        }


        if (rating < 1 || rating > 5) {

            return res.status(400).json({
                success: false,
                message: "Rating must be between 1 and 5"
            });

        }


        /* Insert review */

        const [result] = await db.query(
            `
            INSERT INTO reviews
            (
                booking_id,
                customer_id,
                provider_id,
                rating,
                comment
            )
            VALUES (?, ?, ?, ?, ?)
            `,
            [
                booking_id,
                customer_id,
                provider_id,
                rating,
                comment || null
            ]
        );


        /* Update provider rating */

        await db.query(
            `
            UPDATE providers
            SET
                rating = (
                    SELECT AVG(rating)
                    FROM reviews
                    WHERE provider_id = ?
                ),

                total_reviews = (
                    SELECT COUNT(*)
                    FROM reviews
                    WHERE provider_id = ?
                )

            WHERE id = ?
            `,
            [
                provider_id,
                provider_id,
                provider_id
            ]
        );


        res.status(201).json({
            success: true,
            message: "Review submitted successfully",
            review_id: result.insertId
        });


    } catch (error) {

        console.error(
            "Review error:",
            error
        );


        res.status(500).json({
            success: false,
            message: "Failed to submit review",
            error: error.message
        });

    }

});


/* =====================================================
   ADMIN DASHBOARD - STATISTICS
===================================================== */

app.get("/api/admin/stats", async (req, res) => {

    try {

        const [[usersResult]] = await db.query(`
            SELECT COUNT(*) AS total_users
            FROM users
        `);


        const [[providersResult]] = await db.query(`
            SELECT COUNT(*) AS total_providers
            FROM providers
        `);


        const [[bookingsResult]] = await db.query(`
            SELECT COUNT(*) AS bookings_this_month
            FROM bookings
            WHERE MONTH(booking_date) = MONTH(CURDATE())
            AND YEAR(booking_date) = YEAR(CURDATE())
        `);


        const [[revenueResult]] = await db.query(`
            SELECT COALESCE(SUM(s.price), 0) AS revenue
            FROM bookings b

            JOIN services s
                ON b.service_id = s.id

            WHERE b.status = 'Completed'
        `);


        const [categoryRows] = await db.query(`
            SELECT
                c.name,
                COUNT(p.id) AS providers

            FROM categories c

            LEFT JOIN providers p
                ON p.category_id = c.id

            GROUP BY c.id, c.name

            ORDER BY c.id
        `);


        res.json({
            success: true,

            stats: {

                totalUsers:
                    Number(usersResult.total_users) || 0,

                activeProviders:
                    Number(providersResult.total_providers) || 0,

                bookingsThisMonth:
                    Number(bookingsResult.bookings_this_month) || 0,

                revenue:
                    Number(revenueResult.revenue) || 0,

                categorySplit:
                    categoryRows.map(row => ({
                        name: row.name,
                        providers:
                            Number(row.providers) || 0
                    }))
            }
        });


    } catch (error) {

        console.error(
            "Admin stats error:",
            error
        );


        res.status(500).json({
            success: false,
            message: "Failed to load admin statistics",
            error: error.message
        });

    }

});


// ===============================
// ADMIN CATEGORY MANAGEMENT
// ===============================

// ADD CATEGORY
app.post("/api/admin/categories", async (req, res) => {
    try {
        const { name, description } = req.body;

        if (!name || !name.trim()) {
            return res.status(400).json({
                success: false,
                message: "Category name is required"
            });
        }

        const [existing] = await db.query(
            "SELECT id FROM categories WHERE name = ?",
            [name.trim()]
        );

        if (existing.length > 0) {
            return res.status(409).json({
                success: false,
                message: "Category already exists"
            });
        }

        const [result] = await db.query(
            `
            INSERT INTO categories
            (name, description)
            VALUES (?, ?)
            `,
            [
                name.trim(),
                description?.trim() || null
            ]
        );

        const [rows] = await db.query(
            `
            SELECT id, name, description
            FROM categories
            WHERE id = ?
            `,
            [result.insertId]
        );

        res.status(201).json({
            success: true,
            message: "Category added successfully",
            category: rows[0]
        });

    } catch (error) {
        console.error("Add category error:", error);

        res.status(500).json({
            success: false,
            message: "Failed to add category",
            error: error.message
        });
    }
});


// EDIT CATEGORY
app.put("/api/admin/categories/:id", async (req, res) => {
    try {
        const { id } = req.params;
        const { name, description } = req.body;

        if (!name || !name.trim()) {
            return res.status(400).json({
                success: false,
                message: "Category name is required"
            });
        }

        const [existing] = await db.query(
            `
            SELECT id
            FROM categories
            WHERE name = ?
            AND id != ?
            `,
            [
                name.trim(),
                id
            ]
        );

        if (existing.length > 0) {
            return res.status(409).json({
                success: false,
                message: "Another category already has this name"
            });
        }

        const [result] = await db.query(
            `
            UPDATE categories
            SET
                name = ?,
                description = ?
            WHERE id = ?
            `,
            [
                name.trim(),
                description?.trim() || null,
                id
            ]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({
                success: false,
                message: "Category not found"
            });
        }

        const [rows] = await db.query(
            `
            SELECT id, name, description
            FROM categories
            WHERE id = ?
            `,
            [id]
        );

        res.json({
            success: true,
            message: "Category updated successfully",
            category: rows[0]
        });

    } catch (error) {
        console.error("Edit category error:", error);

        res.status(500).json({
            success: false,
            message: "Failed to update category",
            error: error.message
        });
    }
});


// DELETE CATEGORY
app.delete("/api/admin/categories/:id", async (req, res) => {
    try {
        const { id } = req.params;

        const [providers] = await db.query(
            `
            SELECT COUNT(*) AS count
            FROM providers
            WHERE category_id = ?
            `,
            [id]
        );

        if (Number(providers[0].count) > 0) {
            return res.status(409).json({
                success: false,
                message:
                    "Cannot delete this category because providers are using it."
            });
        }

        const [result] = await db.query(
            `
            DELETE FROM categories
            WHERE id = ?
            `,
            [id]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({
                success: false,
                message: "Category not found"
            });
        }

        res.json({
            success: true,
            message: "Category deleted successfully"
        });

    } catch (error) {
        console.error("Delete category error:", error);

        res.status(500).json({
            success: false,
            message: "Failed to delete category",
            error: error.message
        });
    }
});


/* =====================================================
   ADMIN - GET ALL USERS AND PROVIDERS
===================================================== */

app.get("/api/admin/users", async (req, res) => {

    try {

        const [users] = await db.query(`
            SELECT
                u.id,
                u.name,
                u.email,
                u.role,
                u.status,

                p.id AS provider_id,
                p.business_name,
                p.category_id,

                c.name AS category_name,

                p.rating,
                p.total_reviews

            FROM users u

            LEFT JOIN providers p
                ON p.user_id = u.id

            LEFT JOIN categories c
                ON p.category_id = c.id

            ORDER BY u.id DESC
        `);


        res.json({
            success: true,
            users: users
        });


    } catch (error) {

        console.error(
            "Admin users error:",
            error
        );


        res.status(500).json({
            success: false,
            message: "Failed to load users",
            error: error.message
        });

    }

});


/* =====================================================
   ADMIN - ACTIVATE / DEACTIVATE USER
===================================================== */

app.put("/api/admin/users/:id/status", async (req, res) => {

    try {

        const { id } = req.params;

        const { status } = req.body;


        if (
            !["active", "inactive"].includes(status)
        ) {

            return res.status(400).json({
                success: false,
                message:
                    "Invalid status. Use active or inactive."
            });

        }


        const [result] = await db.query(
            `
            UPDATE users
            SET status = ?
            WHERE id = ?
            `,
            [
                status,
                id
            ]
        );


        if (result.affectedRows === 0) {

            return res.status(404).json({
                success: false,
                message: "User not found"
            });

        }


        res.json({
            success: true,

            message:
                status === "active"
                    ? "User activated successfully"
                    : "User deactivated successfully"
        });


    } catch (error) {

        console.error(
            "Admin status update error:",
            error
        );


        res.status(500).json({
            success: false,
            message:
                "Failed to update user status",
            error: error.message
        });

    }

});


/* =====================================================
   START SERVER
===================================================== */

const PORT = process.env.PORT || 5000;

app.get("/api/admin/reviews", async (req, res) => {
    try {
        const [reviews] = await db.query(`
            SELECT
                r.id,
                r.rating,
                r.comment,
                r.created_at,
                u.name AS customer_name,
                pu.name AS provider_name,
                s.name AS service_name
            FROM reviews r
            JOIN users u
                ON r.customer_id = u.id
            JOIN providers p
                ON r.provider_id = p.id
            JOIN users pu
                ON p.user_id = pu.id
            JOIN bookings b
                ON r.booking_id = b.id
            JOIN services s
                ON b.service_id = s.id
            ORDER BY r.id DESC
        `);

        res.json({
            success: true,
            reviews
        });
    } catch (error) {
        console.error("Admin reviews error:", error);

        res.status(500).json({
            success: false,
            message: "Failed to load reviews",
            error: error.message
        });
    }
});

app.listen(PORT, () => {

    console.log(
        `Server running on http://localhost:${PORT}`
    );

});