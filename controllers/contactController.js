import ContactMessage from "../models/contactMessage.js"

export async function createContactMessage(req, res) {
    try {
        const { name, email, subject, message } = req.body

        if (!name || !email || !subject || !message) {
            res.status(400).json({ message: "All fields are required" })
            return
        }

        const contactMessage = new ContactMessage({
            name,
            email,
            subject,
            message
        })

        await contactMessage.save()
        res.json({ message: "Your query has been sent successfully" })
    } catch (error) {
        console.log(error)
        res.status(500).json({ message: "Error sending your query" })
    }
}

// Admin only - view submitted queries
export async function getContactMessages(req, res) {
    if (req.user == null || !req.user.isAdmin) {
        res.status(403).json({ message: "Forbidden" })
        return
    }
    try {
        const messages = await ContactMessage.find().sort({ createdAt: -1 })
        res.json(messages)
    } catch (error) {
        console.log(error)
        res.status(500).json({ message: "Error fetching queries" })
    }
}
// export async function getMyOrders(req, res) {
//     if (req.user == null) {
//         res.status(401).json({ message: "Unauthorized" })
//         return
//     }
//     try {
//         const pageSize = parseInt(req.params.pageSize) || 10
//         const currentPage = parseInt(req.params.currentPage) || 1
 
//         const total = await Order.countDocuments({ email: req.user.email })
//         const orders = await Order.find({ email: req.user.email })
//             .sort({ date: -1 })
//             .skip((currentPage - 1) * pageSize)
//             .limit(pageSize)
 
//         res.json({ orders, total })
//     } catch (error) {
//         console.log(error)
//         res.status(500).json({ message: "Error fetching your orders" })
//     }
// }
 