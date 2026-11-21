import { Request, Response } from "express";
import { Restaurant } from "../models/Restaurant.js";
import jwt from 'jsonwebtoken';
import { Booking } from "../models/booking.js";
import { User } from "../models/user.js";


// get all the restaurants with search and filters
// GET /api/restaurants
export const getRestaurants = async (req:Request , res:Response) : Promise<void> => {
    try {
        const { search, priceRange, rating, location, sort} = req.query;

        // build query object
        const queryObj:any = {status: "approved"};

        if(search){
            queryObj.$or = [
                {name: { $regex: search, $options: "i"}},
                {tags: { $regex: search, $options: "i"}},
                {location: { $regex: search, $options: "i"}}
            ]
        }
        if(priceRange){
            const prices = Array.isArray(priceRange) ? priceRange : [priceRange];
            queryObj.priceRange = {$in: prices};
        }

        if(rating){
            queryObj.rating = {$gte: parseFloat(rating as string)};
        }

        if(location){
            queryObj.location = {$regex: location as string, $option: "i"};
        }

        //SORTING
        let sortOption: any = {createdAt: -1}
        if(sort === "rating"){
            sortOption = {rating: -1}
        }else if(sort === "price_low"){
            sortOption = {priceRange: 1};
        }else if(sort === "price_high"){
            sortOption = {priceRange: -1};
        }
        const restaurant = await Restaurant.find(queryObj).sort(sortOption);
        res.json(restaurant)

    } catch (error: any) {
        console.error(error);
        res.status(400).json({ message: error.message });

    }
}


// Get Featured and Exclusive Restaurants
// GET /api/restaurants/featured
export const getFeaturedRestaurants = async (req:Request , res:Response) : Promise<void> => {
    try {
        const featured = await Restaurant.find({
            status: "Approved",
            $or: [{ featured: true } , { exclusive: true }]
        }).limit(6)
        res.json(featured);
    } catch (error) {
        console.error("Get Featured Restaurants Error:", error);
        res.status(500).json({ message: "Server error" });
    }
}


// Get single restaurants by slug
// GET /api/restaurants/:slug
export const getRestaurantBySlug = async (req:Request , res:Response) : Promise<void> => {
    try {
        const restaurant = await Restaurant.findOne({ slug: req.params.slug })
        if(!restaurant){
            res.status(404).json({message: "Restaurant not found"});
            return;
        }

        // If not approved, verify authentication (owner or admin)
        if(restaurant.status !== "Approved"){
            let isAuthorized = false;
            if(req.headers.authorization && req.headers.authorization.startsWith("Bearer")){
                try {
                    const token = req.headers.authorization.split(" ")[1];
                    const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as 
                    {id: string};

                    const user = await User.findById(decoded.id);
                    if(user && (user.role === "admin" || (user.role === "owner" && restaurant.owner.toString() === user._id.toString())))
                    {
                        isAuthorized: true
                    }
                } catch (err) {
                    // Ignore token verify error
                }
            }
            if(!isAuthorized){
                res.status(404).json({ message: "Restaurant not found or pending approved"});
                return;
            }
        }
        res.json(restaurant);
    } catch (error: any) {
        console.error(error);
        res.status(400).json({ message: error.message });
    }
}


// Get dynamic seat availability for slots
// GET /api/restaurants/:id/availability
export const getRestaurantAvailability = async (req:Request , res:Response) : Promise<void> => {
    try {
        const { date } = req.query;
        if(!date){
            res.status(400).json({ message: "please provide a date"});
            return;
        }

        const restaurant = await Restaurant.findById(req.params.id);
        if(!restaurant) {
            res.status(404).json({message: "Restaurant Not Found"});
            return;
        }

        const bookingDate = new Date(date as string)

        //Get all the active booking on this date of the restaurant
        const bookings = await Booking.find({
            restaurant: restaurant._id,
            date: bookingDate,
            status: "confirmed",
        });

        //Map slots to available capacities

        const availability = restaurant.availableSlots.map((slot)=>{
            const bookedSeats = bookings
            .filter((b) => b.time === slot)
            .reduce((sum: number, b) => sum + b.guests, 0);
            const totalSeats = restaurant.totalSeats || 20;
            const availableSeats = Math.max(0, totalSeats - bookedSeats);
            return {
                time: slot,
                availableSeats,
                isAvailable: availableSeats > 0
            }
        }) 

        res.json(availability)


    } catch (error: any) {
        console.error(error);
        res.status(400).json({ message: error.message });

    }
}