import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShoppingBag, Clock, Users, Plus, Minus, X, CheckCircle, AlertOctagon, User, LogOut, Edit2, Save } from 'lucide-react';
import { TIME_SLOTS } from '../data/mockData';
import { useCart } from '../context/CartContext';
import { useCanteen } from '../context/CanteenContext';
import { useNavigate } from 'react-router-dom'; // Import useNavigate
import QRCode from 'react-qr-code';
import AIChatbot from '../components/AIChatbot';
import VotingSection from '../components/VotingSection';

const StudentDashboard = () => {
    const { cart, addToCart, removeFromCart, updateQuantity, totalAmount, clearCart } = useCart();
    const { menuItems, placeOrder, isBookingPaused, analytics, orders } = useCanteen();
    const navigate = useNavigate(); // Hook for navigation

    // Derived Analytics from Context
    const { crowdLevel, crowdColor, estimatedWaitTime } = analytics;

    const [selectedCategory, setSelectedCategory] = useState("All");
    const [selectedSlot, setSelectedSlot] = useState(null);
    const [showCart, setShowCart] = useState(false);
    const [orderPlaced, setOrderPlaced] = useState(false);
    const [lastOrderQr, setLastOrderQr] = useState(null);
    const [showProfile, setShowProfile] = useState(false);

    // -- User Profile State --
    const [userProfile, setUserProfile] = useState({
        name: localStorage.getItem('studentName') || "John Doe",
        studentId: localStorage.getItem('studentId') || "#2024001",
        email: localStorage.getItem('studentEmail') || "john@uni.edu"
    });
    const [isEditingProfile, setIsEditingProfile] = useState(false);
    const [editForm, setEditForm] = useState(userProfile);

    const categories = ["All", ...new Set(menuItems.map(item => item.category))];
    const filteredItems = selectedCategory === "All"
        ? menuItems
        : menuItems.filter(item => item.category === selectedCategory);

    // Filter orders: Match by ID (preferred) or Name (legacy/fallback)
    const myOrders = (Array.isArray(orders) && userProfile)
        ? orders.filter(o =>
            o.userId === userProfile.studentId ||
            (!o.userId && o.user === userProfile.name)
        )
        : [];

    const [activeDashboardTab, setActiveDashboardTab] = useState('menu'); // 'menu' | 'vote'

    const handleCheckout = () => {
        // ... (existing checkout logic)
        if (!selectedSlot) {
            alert("Please select a time slot first!");
            return;
        }

        // Checkout Logic
        const newOrder = {
            id: `ORD-${Date.now().toString().slice(-4)}`,
            items: cart,
            totalAmount,
            slot: selectedSlot.time,
            status: 'Pending',
            user: userProfile.name, // Use dynamic name
            userId: userProfile.studentId, // Add student ID to order
            createdAt: new Date()
        };

        placeOrder(newOrder); // Add to Global Context
        setLastOrderQr(JSON.stringify({ orderId: newOrder.id }));
        clearCart();

        // Simulate Payment
        setTimeout(() => {
            setOrderPlaced(true);
            setShowCart(false);
        }, 1000);
    };

    const handleSaveProfile = () => {
        setUserProfile(editForm);
        setIsEditingProfile(false);
    };

    const handleLogout = () => {
        // Clear any auth tokens if we had them
        navigate('/');
    };

    if (orderPlaced) {
        // ... (existing order success screen)
        return (
            <div className="flex flex-col items-center justify-center h-[80vh] text-center space-y-6">
                <motion.div
                    initial={{ scale: 0 }} animate={{ scale: 1 }}
                    className="bg-green-500/20 p-6 rounded-full"
                >
                    <CheckCircle size={64} className="text-green-500" />
                </motion.div>
                <div>
                    <h2 className="text-3xl font-bold text-white mb-2">Order Confirmed!</h2>
                    <p className="text-gray-400">Your lunch is booked for {selectedSlot.time}</p>
                </div>

                <div className="bg-white p-4 rounded-xl">
                    <QRCode value={lastOrderQr} size={200} />
                </div>
                <p className="text-sm text-gray-500">Show this QR at the counter</p>

                <button onClick={() => setOrderPlaced(false)} className="text-primary underline mt-4">Place another order</button>
            </div>
        )
    }

    return (
        <div className="space-y-6 pt-6 pb-24 relative">
            <header className="flex justify-between items-center px-2">
                <div>
                    <h1 className="text-2xl font-bold bg-gradient-to-r from-primary to-white bg-clip-text text-transparent">Hello, {userProfile.name.split(' ')[0]}</h1>
                    <p className="text-gray-400 text-sm">What are you craving today?</p>
                </div>
                <div className="flex gap-3">
                    <button onClick={() => setShowProfile(true)} className="h-10 w-10 glass-card flex items-center justify-center text-gray-400 hover:text-white transition-colors">
                        <User size={20} />
                    </button>
                    <div className="relative cursor-pointer" onClick={() => setShowCart(true)}>
                        <div className="h-10 w-10 glass-card flex items-center justify-center text-primary transition-transform active:scale-95">
                            <ShoppingBag size={20} />
                        </div>
                        {cart.length > 0 && (
                            <span className="absolute -top-1 -right-1 h-5 w-5 bg-secondary rounded-full flex items-center justify-center text-xs font-bold text-white animate-bounce">
                                {cart.reduce((a, b) => a + b.quantity, 0)}
                            </span>
                        )}
                    </div>
                </div>
            </header>

            {/* Main Tabs */}
            <div className="flex p-1 bg-white/5 rounded-xl mx-1 border border-white/10">
                <button
                    onClick={() => setActiveDashboardTab('menu')}
                    className={`flex-1 py-2 text-sm font-bold rounded-lg transition-all ${activeDashboardTab === 'menu' ? 'bg-primary text-black shadow-lg' : 'text-gray-400 hover:text-white'}`}
                >
                    Order Food
                </button>
                <button
                    onClick={() => setActiveDashboardTab('vote')}
                    className={`flex-1 py-2 text-sm font-bold rounded-lg transition-all ${activeDashboardTab === 'vote' ? 'bg-primary text-black shadow-lg' : 'text-gray-400 hover:text-white'}`}
                >
                    Vote for Tomorrow
                </button>
            </div>

            {/* Smart Queue Display (Always Visible) */}
            <div className="grid grid-cols-2 gap-4">
                <motion.div
                    initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}
                    className="glass-card p-4 flex flex-col justify-between"
                >
                    <div className="flex justify-between items-start mb-2">
                        <p className="text-gray-400 text-xs uppercase tracking-wider">Crowd Level</p>
                        <Users size={16} className={crowdColor} />
                    </div>
                    <p className={`text-xl font-bold flex items-center gap-2 ${crowdColor}`}>
                        {crowdLevel}
                    </p>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}
                    className="glass-card p-4 flex flex-col justify-between"
                >
                    <div className="flex justify-between items-start mb-2">
                        <p className="text-gray-400 text-xs uppercase tracking-wider">Wait Time</p>
                        <Clock size={16} className="text-white" />
                    </div>
                    <p className="text-white text-xl font-bold">~{estimatedWaitTime} min</p>
                    <p className="text-[10px] text-gray-400">Serving ~3 students/min</p>
                </motion.div>
            </div>

            {/* Booking Paused Alert */}
            {isBookingPaused && (
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-red-500/20 border border-red-500/50 p-4 rounded-xl flex gap-3 items-center"
                >
                    <AlertOctagon className="text-red-500 shrink-0" />
                    <div>
                        <h4 className="font-bold text-red-500">Booking Paused</h4>
                        <p className="text-xs text-red-300">The canteen is currently at maximum capacity. Please wait.</p>
                    </div>
                </motion.div>
            )}

            {/* --- TAB CONTENT --- */}

            {activeDashboardTab === 'vote' && (
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
                    <VotingSection />
                </motion.div>
            )}

            {activeDashboardTab === 'menu' && (
                <>
                    {/* Category Filter */}
                    <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar">
                        {categories.map(cat => (
                            <button
                                key={cat}
                                onClick={() => setSelectedCategory(cat)}
                                className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${selectedCategory === cat ? 'bg-primary text-black' : 'bg-card text-gray-400 border border-white/5'}`}
                            >
                                {cat}
                            </button>
                        ))}
                    </div>

                    {/* Menu Grid - 3 Columns */}
                    <div className="grid grid-cols-3 gap-2 pb-24 px-1">
                        {filteredItems.map((item) => (
                            <motion.div
                                layout
                                key={item.id}
                                className="glass-card p-1.5 flex flex-col gap-1.5 relative overflow-hidden group"
                            >
                                {/* Image */}
                                <div className="h-32 w-full rounded-md bg-gray-800 overflow-hidden relative">
                                    <img src={item.image} alt={item.name} className="h-full w-full object-cover transition-transform group-hover:scale-110" />
                                    <div className="absolute top-1 right-1 bg-black/60 backdrop-blur-md px-1 py-0.5 rounded text-[8px] text-white flex gap-0.5 items-center">
                                        ⭐ {item.rating}
                                    </div>
                                </div>

                                {/* Content */}
                                <div className="flex flex-col flex-1 justify-between">
                                    <div>
                                        <h4 className="font-semibold text-white text-xs leading-tight line-clamp-2 min-h-[2rem]">{item.name}</h4>
                                    </div>

                                    <div className="mt-1.5 flex items-center justify-between gap-1">
                                        <span className="text-primary font-bold text-xs">₹{item.price}</span>
                                        <button
                                            onClick={() => {
                                                addToCart(item);
                                                // Show Simple Toast
                                                const toast = document.createElement("div");
                                                toast.className = "fixed top-4 left-1/2 transform -translate-x-1/2 bg-green-500 text-white px-4 py-2 rounded-full shadow-lg z-50 text-xs font-bold animate-fade-in-down";
                                                toast.innerText = `Added ${item.name}!`;
                                                document.body.appendChild(toast);
                                                setTimeout(() => toast.remove(), 2000);
                                            }}
                                            disabled={isBookingPaused}
                                            className={`h-6 w-6 rounded-full flex items-center justify-center transition-colors ${isBookingPaused
                                                ? 'bg-gray-700 text-gray-500 cursor-not-allowed'
                                                : 'bg-primary text-black hover:bg-white'
                                                }`}
                                        >
                                            <Plus size={12} />
                                        </button>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </>
            )}

            {/* Cart Modal */}
            <AnimatePresence>
                {showCart && (
                    <>
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setShowCart(false)}
                            className="fixed inset-0 bg-black/80 z-40 backdrop-blur-sm"
                        />
                        <motion.div
                            initial={{ y: "100%" }}
                            animate={{ y: 0 }}
                            exit={{ y: "100%" }}
                            className="fixed bottom-0 left-0 right-0 z-50 bg-[#121212] rounded-t-3xl border-t border-white/10 p-6 max-h-[85vh] overflow-y-auto"
                        >
                            <div className="flex justify-between items-center mb-6">
                                <h2 className="text-xl font-bold text-white">Your Cart</h2>
                                <button onClick={() => setShowCart(false)} className="bg-white/10 p-2 rounded-full"><X size={18} /></button>
                            </div>

                            {cart.length === 0 ? (
                                <div className="text-center py-10 text-gray-500">Your cart is empty</div>
                            ) : (
                                <>
                                    <div className="space-y-4 mb-8">
                                        {cart.map(item => (
                                            <div key={item.id} className="flex justify-between items-center bg-white/5 p-3 rounded-xl">
                                                <div className="flex gap-3 items-center">
                                                    <div className="h-10 w-10 rounded-lg bg-gray-700 overflow-hidden">
                                                        <img src={item.image} className="h-full w-full object-cover" />
                                                    </div>
                                                    <div>
                                                        <p className="font-medium text-white text-sm">{item.name}</p>
                                                        <p className="text-xs text-gray-400">₹{item.price * item.quantity}</p>
                                                    </div>
                                                </div>

                                                <div className="flex items-center gap-3 bg-black/40 rounded-lg p-1">
                                                    <button onClick={() => updateQuantity(item.id, -1)} className="p-1 text-gray-400 hover:text-white"><Minus size={14} /></button>
                                                    <span className="text-sm font-bold min-w-[20px] text-center">{item.quantity}</span>
                                                    <button onClick={() => updateQuantity(item.id, 1)} className="p-1 text-gray-400 hover:text-white"><Plus size={14} /></button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>

                                    <div className="mb-6">
                                        <h3 className="text-sm font-semibold text-gray-300 mb-3">Select Pickup Slot</h3>
                                        <div className="grid grid-cols-2 gap-2">
                                            {TIME_SLOTS.map(slot => (
                                                <button
                                                    key={slot.id}
                                                    onClick={() => setSelectedSlot(slot)}
                                                    disabled={slot.booked >= slot.capacity}
                                                    className={`p-3 rounded-xl border text-left transition-all ${selectedSlot?.id === slot.id
                                                        ? 'border-primary bg-primary/10 text-primary'
                                                        : 'border-white/10 bg-white/5 text-gray-400 hover:bg-white/10'
                                                        } ${slot.booked >= slot.capacity ? 'opacity-50 cursor-not-allowed' : ''}`}
                                                >
                                                    <p className="text-xs font-bold">{slot.time}</p>
                                                    <p className="text-[10px] opacity-70 mt-1">{slot.capacity - slot.booked} spots left</p>
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    <div className="border-t border-white/10 pt-4 mb-4">
                                        <div className="flex justify-between items-center text-lg font-bold text-white">
                                            <span>Total</span>
                                            <span>₹ {totalAmount}</span>
                                        </div>
                                    </div>

                                    <button
                                        onClick={handleCheckout}
                                        disabled={isBookingPaused}
                                        className={`w-full font-bold py-4 rounded-xl shadow-lg transition-all text-lg ${isBookingPaused
                                            ? 'bg-gray-700 text-gray-400 cursor-not-allowed'
                                            : 'bg-gradient-to-r from-primary to-secondary text-white hover:scale-[1.02] active:scale-95 shadow-primary/20'
                                            }`}
                                    >
                                        {isBookingPaused ? 'Booking Paused' : 'Pay & Book Slot'}
                                    </button>
                                </>
                            )}
                        </motion.div>
                    </>
                )}
            </AnimatePresence>

            {/* Student Profile Modal -- Always Available */}
            <AnimatePresence>
                {showProfile && (
                    <>
                        <motion.div
                            key="profile-backdrop"
                            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                            onClick={() => setShowProfile(false)}
                            className="fixed inset-0 bg-black/80 z-[60] backdrop-blur-sm"
                        />
                        <motion.div
                            key="profile-content"
                            initial={{ x: "100%" }} animate={{ x: 0 }} exit={{ x: "100%" }}
                            className="fixed top-0 bottom-0 right-0 z-[70] bg-[#121212] w-3/4 max-w-sm border-l border-white/10 p-6 flex flex-col"
                        >
                            <h2 className="text-2xl font-bold text-white mb-6">My Account</h2>

                            <div className="bg-white/5 p-4 rounded-xl mb-6 relative group">
                                <div className="h-16 w-16 bg-gradient-to-tr from-primary to-secondary rounded-full flex items-center justify-center text-2xl font-bold text-white mb-3 shadow-lg shadow-primary/20">
                                    {(userProfile?.name || "U").charAt(0)}
                                </div>

                                {isEditingProfile ? (
                                    <div className="space-y-3 mt-2">
                                        <div>
                                            <label className="text-[10px] text-gray-400 uppercase tracking-wider">Name</label>
                                            <input
                                                value={editForm.name}
                                                onChange={e => setEditForm({ ...editForm, name: e.target.value })}
                                                className="w-full bg-black/20 border border-white/10 rounded px-2 py-1 text-white text-sm"
                                            />
                                        </div>
                                        <div>
                                            <label className="text-[10px] text-gray-400 uppercase tracking-wider">Student ID</label>
                                            <input
                                                value={editForm.studentId}
                                                onChange={e => setEditForm({ ...editForm, studentId: e.target.value })}
                                                className="w-full bg-black/20 border border-white/10 rounded px-2 py-1 text-white text-sm"
                                            />
                                        </div>
                                        <div className="flex gap-2 pt-2">
                                            <button onClick={handleSaveProfile} className="flex-1 bg-green-500/20 text-green-400 py-1 rounded text-xs font-bold flex items-center justify-center gap-1">
                                                <Save size={12} /> Save
                                            </button>
                                            <button onClick={() => { setIsEditingProfile(false); setEditForm(userProfile) }} className="flex-1 bg-white/10 text-white py-1 rounded text-xs">
                                                Cancel
                                            </button>
                                        </div>
                                    </div>
                                ) : (
                                    <>
                                        <button
                                            onClick={() => { setIsEditingProfile(true); setEditForm(userProfile) }}
                                            className="absolute top-4 right-4 p-2 bg-white/5 rounded-full text-gray-400 hover:text-white hover:bg-white/10 transition-colors"
                                        >
                                            <Edit2 size={16} />
                                        </button>
                                        <h3 className="font-bold text-white text-lg">{userProfile?.name || "Guest"}</h3>
                                        <p className="text-gray-400 text-sm">{userProfile?.studentId || "N/A"}</p>
                                        <p className="text-gray-500 text-xs mt-1">{userProfile?.email || "No Email"}</p>
                                    </>
                                )}
                            </div>

                            <h3 className="font-bold text-white mb-4 flex items-center gap-2">
                                <Clock size={16} className="text-primary" /> Past Orders
                            </h3>

                            <div className="space-y-3 overflow-y-auto flex-1 pr-1 custom-scrollbar">
                                {/* Filter orders for this student */}
                                {myOrders.length === 0 ? (
                                    <p className="text-gray-500 text-xs text-center py-4">No past orders found.</p>
                                ) : (
                                    myOrders.map(order => (
                                        <div key={order.id} className={`glass-card p-3 border-l-2 ${order.status === 'Served' ? 'border-green-500 bg-white/5 opacity-60' : 'border-yellow-500 bg-white/10'}`}>
                                            <div className="flex justify-between items-start">
                                                <div>
                                                    <span className="text-white font-medium text-sm">
                                                        {order.items && Array.isArray(order.items) ? order.items.map(i => i.name).join(", ") : "Unknown Items"}
                                                    </span>
                                                    <p className="text-gray-500 text-[10px] mt-0.5">
                                                        {(() => {
                                                            try {
                                                                const d = order.createdAt instanceof Date ? order.createdAt : new Date(order.createdAt);
                                                                if (isNaN(d.getTime())) return "Date Unknown";
                                                                return d.toLocaleDateString() + ", " + d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                                                            } catch (e) {
                                                                return "Date Unknown";
                                                            }
                                                        })()}
                                                    </p>
                                                </div>
                                                <span className={`text-[10px] px-2 py-0.5 rounded border ${order.status === 'Served'
                                                    ? 'bg-green-500/10 text-green-400 border-green-500/20'
                                                    : 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20'
                                                    }`}>
                                                    {order.status}
                                                </span>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>

                            <div className="mt-6 space-y-3">
                                <button onClick={handleLogout} className="w-full p-3 bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 rounded-xl text-red-500 flex items-center justify-center gap-2 transition-colors">
                                    <LogOut size={18} />
                                    Logout
                                </button>
                                <button onClick={() => setShowProfile(false)} className="w-full p-3 bg-white/10 rounded-xl text-white hover:bg-white/20 transition-colors">
                                    Close Menu
                                </button>
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>

            <AIChatbot />
        </div>
    );
};

export default StudentDashboard;
