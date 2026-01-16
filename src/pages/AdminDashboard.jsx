import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { BarChart, QrCode, Utensils, AlertTriangle, CheckCircle, Clock, Plus, Trash2, TrendingUp, DollarSign, User, LogOut, Edit2, Save, X } from 'lucide-react';
import { useCanteen } from '../context/CanteenContext';
import { useNavigate } from 'react-router-dom';
import { Html5QrcodeScanner } from 'html5-qrcode';
import { useEffect } from 'react';

// Isolated Scanner Component to handle DOM lifecycle
const ScannerComponent = ({ onScan, onError }) => {
    useEffect(() => {
        const scanner = new Html5QrcodeScanner(
            "reader",
            { fps: 10, qrbox: { width: 250, height: 250 } },
            /* verbose= */ false
        );

        scanner.render(
            (decodedText) => {
                onScan(decodedText);
            },
            (errorMessage) => {
                // Ignore errors while scanning (common in video stream)
            }
        );

        return () => {
            scanner.clear().catch(error => console.error("Failed to clear html5-qrcode scanner. ", error));
        };
    }, []);

    return <div id="reader" className="w-full"></div>;
};

const AdminDashboard = () => {
    const {
        menuItems, addMenuItem, deleteMenuItem,
        orders, markOrderServed,
        isBookingPaused, setIsBookingPaused,
        addPollItem, deletePollItem, pollItems,
        analytics
    } = useCanteen();
    const navigate = useNavigate();

    const [activeTab, setActiveTab] = useState('orders'); // orders, menu, analytics
    const [showScanner, setShowScanner] = useState(false);
    const [scannerResult, setScannerResult] = useState("");
    const [showProfile, setShowProfile] = useState(false);

    // -- Admin Profile State --
    const [adminProfile, setAdminProfile] = useState({
        name: "Canteen Manager",
        staffId: "STF-001",
        email: "admin@uni.edu"
    });
    const [isEditingProfile, setIsEditingProfile] = useState(false);
    const [editForm, setEditForm] = useState(adminProfile);

    // New Menu Item Form State
    const [newItemHtml, setNewItemHtml] = useState(false);
    const [newItemName, setNewItemName] = useState("");
    const [newItemPrice, setNewItemPrice] = useState("");
    const [newItemCategory, setNewItemCategory] = useState("Main Course");

    const [pollName, setPollName] = useState("");

    const handleAddMenu = () => {
        addMenuItem({
            name: newItemName,
            price: parseInt(newItemPrice),
            category: newItemCategory,
            image: "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?q=80&w=1000",
            rating: 5.0,
            isSpecial: false
        });
        setNewItemHtml(false);
        setNewItemName("");
        setNewItemPrice("");
    };

    const handleSimulateScan = () => {
        // simulate scanning the first pending order
        const pending = orders.find(o => o.status === 'Pending');
        if (pending) {
            markOrderServed(pending.id);
            setScannerResult(`Success! Order ${pending.id} Served.`);
            // setTimeout(() => setShowScanner(false), 1500); 
        } else {
            setScannerResult("No pending orders to scan.");
        }
    };

    const handleScan = (data) => {
        if (data) {
            try {
                // The QR code contains JSON string like: {"orderId":"ORD-170..."}
                // or sometimes it might just be the text depending on how we generated it. 
                // Let's assume it handles both just in case.
                const parsed = JSON.parse(data.text || data);
                const orderId = parsed.orderId;

                setScannerResult(`Scanned: ${orderId}... Verifying`);

                const order = orders.find(o => o.id === orderId);
                if (order) {
                    if (order.status === 'Pending') {
                        markOrderServed(orderId);
                        setScannerResult(`✅ Success! Order ${orderId} Served.`);
                        // Optional: Close after success
                        // setTimeout(() => setShowScanner(false), 2000);
                    } else {
                        setScannerResult(`⚠️ Order ${orderId} is already served.`);
                    }
                } else {
                    setScannerResult(`❌ Invalid Order ID: ${orderId}`);
                }
            } catch (e) {
                // Fallback if not JSON
                console.log("Scan Error or Non-JSON:", e);
                setScannerResult("Searching...");
            }
        }
    };

    const handleError = (err) => {
        console.error(err);
        setScannerResult("Camera Error: " + err.message);
    };

    const handleSaveProfile = () => {
        setAdminProfile(editForm);
        setIsEditingProfile(false);
    };

    const handleLogout = () => {
        navigate('/');
    };

    return (
        <div className="space-y-6 pt-6 pb-20 relative">
            <header className="flex justify-between items-center px-2">
                <div>
                    <h1 className="text-2xl font-bold bg-gradient-to-r from-secondary to-white bg-clip-text text-transparent">Admin Panel</h1>
                    <p className="text-gray-400 text-sm">Canteen Management</p>
                </div>
                <div className="flex gap-3 items-center">
                    <div className={`px-3 py-1 rounded-full text-xs font-bold flex items-center gap-2 ${!isBookingPaused ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
                        <span className={`h-2 w-2 rounded-full ${!isBookingPaused ? 'bg-green-500' : 'bg-red-500'}`} />
                        <span className="hidden sm:inline">{!isBookingPaused ? 'Booking Active' : 'Booking Paused'}</span>
                    </div>
                    <button onClick={() => setShowProfile(true)} className="h-10 w-10 glass-card flex items-center justify-center text-gray-400 hover:text-white transition-colors">
                        <User size={20} />
                    </button>
                </div>
            </header>

            {/* Tab Navigation */}
            <div className="flex gap-4 border-b border-white/10 overflow-x-auto no-scrollbar">
                {['orders', 'menu', 'analytics'].map(tab => (
                    <button
                        key={tab}
                        onClick={() => setActiveTab(tab)}
                        className={`pb-2 capitalize whitespace-nowrap ${activeTab === tab ? 'text-secondary border-b-2 border-secondary' : 'text-gray-500'}`}
                    >
                        {tab}
                    </button>
                ))}
            </div>

            {/* --- ORDERS TAB --- */}
            {activeTab === 'orders' && (
                <>
                    {/* Stats Overview */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="glass-card p-4">
                            <p className="text-gray-400 text-xs uppercase tracking-wider">Pending Orders</p>
                            <p className="text-2xl font-bold text-white mt-1">{analytics.pendingOrdersCount}</p>
                            <p className="text-xs text-orange-400 mt-1">High Load</p>
                        </div>
                        <div className="glass-card p-4">
                            <p className="text-gray-400 text-xs uppercase tracking-wider">Revenue Today</p>
                            <p className="text-2xl font-bold text-white mt-1">₹ {analytics.totalRevenue}</p>
                        </div>
                    </div>

                    {/* Quick Actions */}
                    <div className="glass-card p-4">
                        <h3 className="text-lg font-bold text-white mb-4">Quick Actions</h3>
                        <div className="grid grid-cols-2 gap-3">
                            <button onClick={() => setIsBookingPaused(!isBookingPaused)} className="bg-white/5 hover:bg-white/10 p-3 rounded-xl border border-white/10 flex flex-col items-center gap-2 transition-colors">
                                <Clock size={20} className={!isBookingPaused ? "text-green-400" : "text-red-400"} />
                                <span className="text-xs text-gray-300">{!isBookingPaused ? 'Pause Booking' : 'Resume Booking'}</span>
                            </button>
                            <button onClick={() => setShowScanner(true)} className="bg-white/5 hover:bg-white/10 p-3 rounded-xl border border-white/10 flex flex-col items-center gap-2 transition-colors">
                                <QrCode size={20} className="text-primary" />
                                <span className="text-xs text-gray-300">Scan Ticket</span>
                            </button>
                        </div>
                    </div>

                    {/* Live Orders Feed */}
                    <div>
                        <div className="flex justify-between items-center mb-4 px-1">
                            <h3 className="text-lg font-bold text-white">Live Queue</h3>
                            <span className="text-xs text-gray-400">Updating live...</span>
                        </div>

                        <div className="space-y-3">
                            {orders.length === 0 && <p className="text-gray-500 text-center py-4">No orders yet.</p>}
                            {orders.map((order) => (
                                <motion.div
                                    layout
                                    key={order.id}
                                    className="glass-card p-4 flex justify-between items-center border-l-4 border-l-primary"
                                >
                                    <div>
                                        <div className="flex items-center gap-2">
                                            <h4 className="font-bold text-white">{order.id}</h4>
                                            <span className="text-xs bg-white/10 px-2 rounded text-gray-300">{order.slot}</span>
                                        </div>
                                        <p className="text-sm text-gray-400 mt-1">{order.items.map(i => i.name).join(", ")}</p>
                                        <p className="text-xs text-gray-500">{order.user}</p>
                                    </div>

                                    {order.status === 'Pending' ? (
                                        <button onClick={() => markOrderServed(order.id)} className="p-2 bg-green-500/20 text-green-400 rounded-lg hover:bg-green-500/30">
                                            <CheckCircle size={20} />
                                        </button>
                                    ) : (
                                        <span className="text-xs text-gray-500 font-medium">Served</span>
                                    )}
                                </motion.div>
                            ))}
                        </div>
                    </div>
                </>
            )}

            {/* --- MENU TAB --- */}
            {activeTab === 'menu' && (
                <div className="space-y-6">
                    <div className="flex justify-between items-center">
                        <h3 className="font-bold text-white">Current Menu</h3>
                        <button onClick={() => setNewItemHtml(!newItemHtml)} className="p-2 bg-primary rounded-lg text-black"><Plus size={18} /></button>
                    </div>

                    <AnimatePresence>
                        {newItemHtml && (
                            <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="glass-card p-4 overflow-hidden">
                                <h4 className="font-bold mb-3 text-white">Add New Item</h4>
                                <div className="space-y-3">
                                    <input placeholder="Item Name" value={newItemName} onChange={e => setNewItemName(e.target.value)} className="w-full bg-black/20 border border-white/10 rounded p-2 text-white" />
                                    <input placeholder="Price" type="number" value={newItemPrice} onChange={e => setNewItemPrice(e.target.value)} className="w-full bg-black/20 border border-white/10 rounded p-2 text-white" />
                                    <select value={newItemCategory} onChange={e => setNewItemCategory(e.target.value)} className="w-full bg-black/20 border border-white/10 rounded p-2 text-white">
                                        <option>Main Course</option>
                                        <option>Veg</option>
                                        <option>Starters</option>
                                        <option>Dessert</option>
                                    </select>
                                    <button onClick={handleAddMenu} className="w-full bg-green-500 text-black font-bold py-2 rounded">Add Item</button>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    <div className="space-y-3">
                        {menuItems.map(item => (
                            <div key={item.id} className="glass-card p-3 flex justify-between items-center">
                                <div className="flex gap-3 items-center">
                                    <img src={item.image} className="h-10 w-10 rounded bg-gray-800 object-cover" />
                                    <div>
                                        <p className="font-bold text-white">{item.name}</p>
                                        <p className="text-xs text-gray-400">₹ {item.price}</p>
                                    </div>
                                </div>
                                <button onClick={() => deleteMenuItem(item.id)} className="text-red-400 p-2"><Trash2 size={16} /></button>
                            </div>
                        ))}
                    </div>

                    <div className="border-t border-white/10 pt-4">
                        <h3 className="font-bold text-white mb-2">Next Day Poll</h3>

                        {/* Poll List */}
                        <div className="space-y-2 mb-4">
                            {pollItems.length === 0 ? (
                                <p className="text-gray-500 text-xs">No active polls.</p>
                            ) : (
                                pollItems.map(poll => (
                                    <div key={poll.id} className="bg-white/5 p-2 rounded flex justify-between items-center group">
                                        <div>
                                            <p className="text-white text-sm">{poll.name}</p>
                                            <p className="text-[10px] text-gray-500">{poll.votes} votes</p>
                                        </div>
                                        <button
                                            onClick={() => deletePollItem(poll.id)}
                                            className="text-red-400 opacity-0 group-hover:opacity-100 p-1 hover:bg-white/10 rounded transition-all"
                                            title="Delete Poll"
                                        >
                                            <Trash2 size={14} />
                                        </button>
                                    </div>
                                ))
                            )}
                        </div>

                        <div className="flex gap-2">
                            <input value={pollName} onChange={e => setPollName(e.target.value)} placeholder="Poll Item Name" className="flex-1 bg-black/20 border border-white/10 rounded p-2 text-white" />
                            <button onClick={() => { addPollItem(pollName); setPollName("") }} className="bg-secondary p-2 rounded text-white">Add</button>
                        </div>
                    </div>
                </div>
            )}

            {/* --- ANALYTICS TAB --- */}
            {activeTab === 'analytics' && (
                <div className="space-y-4">
                    <div className="glass-card p-4">
                        <div className="flex items-center gap-3 mb-4">
                            <TrendingUp className="text-green-400" />
                            <h3 className="font-bold text-white">Sales Overview</h3>
                        </div>
                        <div className="h-32 flex items-end justify-between px-2 gap-2">
                            {[40, 60, 30, 80, 50, 90, 70].map((h, i) => (
                                <div key={i} className="w-full bg-primary/20 rounded-t hover:bg-primary/40 transition-colors" style={{ height: `${h}%` }}></div>
                            ))}
                        </div>
                        <div className="flex justify-between text-xs text-gray-500 mt-2">
                            <span>Mon</span><span>Tue</span><span>Wed</span><span>Thu</span><span>Fri</span><span>Sat</span><span>Sun</span>
                        </div>
                    </div>

                    <div className="glass-card p-4">
                        <h3 className="font-bold text-white mb-3">Peak Time Slots</h3>
                        <div className="space-y-2">
                            <div className="flex justify-between text-sm text-gray-300">
                                <span>12:15 - 12:30</span>
                                <span className="text-primary">85% Full</span>
                            </div>
                            <div className="w-full bg-white/10 rounded-full h-2">
                                <div className="bg-primary h-2 rounded-full" style={{ width: '85%' }}></div>
                            </div>
                        </div>
                    </div>

                    <div className="glass-card p-4 border border-orange-500/20">
                        <div className="flex items-center gap-3 mb-2">
                            <AlertTriangle className="text-orange-500" />
                            <h3 className="font-bold text-white">Wastage Alert</h3>
                        </div>
                        <p className="text-sm text-gray-400">Yesterday we wasted 5kg of Rice. Recommended to reduce rice production by 10% today.</p>
                    </div>
                </div>
            )}

            {/* Real Scanner Modal */}
            {/* Real Scanner Modal with html5-qrcode */}
            <AnimatePresence>
                {showScanner && (
                    <div className="fixed inset-0 z-50 bg-black/90 flex flex-col items-center justify-center p-4">
                        <div className="w-full max-w-sm border-2 border-primary rounded-xl relative flex flex-col items-center justify-center overflow-hidden bg-black min-h-[300px]">
                            {/* Scanner Container */}
                            <ScannerComponent onScan={handleScan} onError={handleError} />

                            {/* Scanning Overlay Animation */}
                            <motion.div
                                animate={{ top: ["0%", "100%", "0%"] }}
                                transition={{ duration: 2, repeat: Infinity }}
                                className="absolute left-0 right-0 h-1 bg-primary shadow-[0_0_20px_#00E0FF] pointer-events-none"
                            />
                        </div>
                        <p className="text-white mt-4 font-bold text-center">{scannerResult || "Align Order QR Code"}</p>

                        <div className="flex gap-4 mt-8">
                            <button onClick={handleSimulateScan} className="px-4 py-2 bg-white/5 rounded-lg text-gray-400 text-xs">Simulate (Test)</button>
                            <button onClick={() => { setShowScanner(false); setScannerResult(""); }} className="px-6 py-2 bg-white/10 rounded-lg text-white">Close Scanner</button>
                        </div>
                    </div>
                )}
            </AnimatePresence>

            {/* Admin Profile Modal */}
            <AnimatePresence>
                {showProfile && (
                    <>
                        <motion.div
                            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                            onClick={() => setShowProfile(false)}
                            className="fixed inset-0 bg-black/80 z-40 backdrop-blur-sm"
                        />
                        <motion.div
                            initial={{ x: "100%" }} animate={{ x: 0 }} exit={{ x: "100%" }}
                            className="fixed top-0 bottom-0 right-0 z-50 bg-[#121212] w-3/4 max-w-sm border-l border-white/10 p-6 flex flex-col"
                        >
                            <h2 className="text-2xl font-bold text-white mb-6">Staff Account</h2>

                            <div className="bg-white/5 p-4 rounded-xl mb-6 relative group">
                                <div className="h-16 w-16 bg-gradient-to-tr from-secondary to-orange-500 rounded-full flex items-center justify-center text-2xl font-bold text-white mb-3 shadow-lg shadow-secondary/20">
                                    {adminProfile.name.charAt(0)}
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
                                            <label className="text-[10px] text-gray-400 uppercase tracking-wider">Staff ID</label>
                                            <input
                                                value={editForm.staffId}
                                                onChange={e => setEditForm({ ...editForm, staffId: e.target.value })}
                                                className="w-full bg-black/20 border border-white/10 rounded px-2 py-1 text-white text-sm"
                                            />
                                        </div>
                                        <div className="flex gap-2 pt-2">
                                            <button onClick={handleSaveProfile} className="flex-1 bg-green-500/20 text-green-400 py-1 rounded text-xs font-bold flex items-center justify-center gap-1">
                                                <Save size={12} /> Save
                                            </button>
                                            <button onClick={() => { setIsEditingProfile(false); setEditForm(adminProfile) }} className="flex-1 bg-white/10 text-white py-1 rounded text-xs">
                                                Cancel
                                            </button>
                                        </div>
                                    </div>
                                ) : (
                                    <>
                                        <button
                                            onClick={() => { setIsEditingProfile(true); setEditForm(adminProfile) }}
                                            className="absolute top-4 right-4 p-2 bg-white/5 rounded-full text-gray-400 hover:text-white hover:bg-white/10 transition-colors"
                                        >
                                            <Edit2 size={16} />
                                        </button>
                                        <h3 className="font-bold text-white text-lg">{adminProfile.name}</h3>
                                        <p className="text-gray-400 text-sm">{adminProfile.staffId}</p>
                                        <p className="text-gray-500 text-xs mt-1">{adminProfile.email}</p>
                                    </>
                                )}
                            </div>

                            <div className="mt-auto space-y-3">
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

        </div>
    );
};

export default AdminDashboard;
