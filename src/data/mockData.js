export const MENU_ITEMS = [
    {
        id: 1,
        name: "Full Chicken Biriyani",
        price: 100,
        category: "Main Course",
        image: "https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?q=80&w=1000&auto=format&fit=crop",
        rating: 4.8,
        isSpecial: true,
    },
    {
        id: 2,
        name: "Half Chicken Biriyani",
        price: 50,
        category: "Main Course",
        image: "https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?q=80&w=1000&auto=format&fit=crop",
        rating: 4.5,
        isSpecial: false,
    },
    {
        id: 3,
        name: "Fish Fry",
        price: 30,
        category: "Non-Veg",
        image: "images/Fishfry.jpeg",
        rating: 4.3,
        isSpecial: false,
    },
    {
        id: 4,
        name: "Veg Meals",
        price: 40,
        category: "Veg",
        image: "images/vegmeals.jpeg",
        rating: 4.6,
        isSpecial: false,
    },
    {
        id: 5,
        name: "Chocolate Brownie",
        price: 60,
        category: "Dessert",
        image: "images/brownie.jpeg",
        rating: 4.7,
        isSpecial: false,
    },
    {
        id: 6,
        name: "Fish Curry",
        price: 90,
        category: "Non-Veg",
        image: "images/fishcurry.jpg",
        rating: 4.6,
        isSpecial: true,
    }
];

export const TIME_SLOTS = [
    { id: 'slot_1', time: '12:00 - 12:15', capacity: 50, booked: 45 },
    { id: 'slot_2', time: '12:15 - 12:30', capacity: 50, booked: 12 },
    { id: 'slot_3', time: '12:30 - 12:45', capacity: 50, booked: 5 },
    { id: 'slot_4', time: '12:45 - 01:00', capacity: 50, booked: 0 },
];
