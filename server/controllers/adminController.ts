import { Response } from "express";
import { AuthRequest } from "../middlewares/auth.js";
import { Restaurant } from "../models/Restaurant.js";
import { User } from "../models/user.js";
import { Booking } from "../models/booking.js";

// Get all restaurants for admin management
// GET /api/admin/restaurants
export const getAllRestaurant = async (req: AuthRequest,res: Response): Promise<void> => {
    try {
        const restaurant = await Restaurant.find({}).populate("owner", "name email phone").sort({ createdAt: -1})
        res.json(restaurant)
    } catch (error: any) {
        console.error(error);
        res.status(400).json({ message: error.message });
    }
}


// Approve/Reject a restaurant profile
// PUT /api/admin/restaurants/:id/approve
export const approveRestaurant = async (req: AuthRequest,res: Response): Promise<void> => {
    try {
        const { status } = req.body;
        if(!status || ![" approved ", " rejected "," pending "].includes(status)){
            res.status(400).json({ message: "Please provide a valid approval status"});
            return;
        }

        const restaurant = await Restaurant.findById(req.params.id);
        if(!restaurant){
            res.status(404).json({ message: "Restaurants profile not found" });
            return;
        }

        restaurant.status = status;
        await restaurant.save();
        res.json(restaurant);
    } catch (error: any) {
        console.error(error);
        res.status(400).json({ message: error.message });
    }
    
}


// Get system statistics
// GET /api/admin/stats
export const getAdminStats = async (req: AuthRequest,res: Response): Promise<void> => {
    try {
        const totalUser = await User.countDocuments({ role: "user" });
        const totalOwner = await User.countDocuments({ role: "owner" });
        const totalBookings = await Booking.countDocuments({})
        const totalRestaurants = await Restaurant.countDocuments({})

        // Get latest 10 bookings
        const latestBookings = await Booking.find({}).populate("user" , "name email").populate("restaurant", "name").sort({createdAt: -1}).limit(10)
        res.json({
            users: {
                totalUser,
                totalOwner,
                total : totalUser + totalOwner,
            },
            restaurants: {
                total: totalRestaurants,
            },
            bookings: {
                total: totalBookings,
            },
            latestBookings

        })
    } catch (error: any) {
        console.error(error);
        res.status(400).json({ message: error.message });
    }
    
}