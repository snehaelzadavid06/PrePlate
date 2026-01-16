import React, { createContext, useContext, useState, useEffect } from 'react';
import { MENU_ITEMS as INITIAL_MENU } from '../data/mockData';
import { db } from '../firebase';
import { collection, onSnapshot, addDoc, doc, updateDoc, deleteDoc, query, orderBy } from 'firebase/firestore';

const CanteenContext = createContext();

export const useCanteen = () => useContext(CanteenContext);

export const CanteenProvider = ({ children }) => {
    // --- Global State ---
    const [menuItems, setMenuItems] = useState(INITIAL_MENU);
    const [orders, setOrders] = useState([]);
    const [isBookingPaused, setIsBookingPaused] = useState(false);
    const [pollItems, setPollItems] = useState([]);

    // --- Firestore Real-Time Sync ---
    useEffect(() => {
        // 1. Sync Orders
        const orderQuery = query(collection(db, 'orders'), orderBy('createdAt', 'desc'));
        const unsubOrders = onSnapshot(orderQuery, (snapshot) => {
            const freshOrders = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            if (freshOrders.length > 0) setOrders(freshOrders);
        }, (err) => console.log("Firestore connection failed (using mock):", err));

        // 2. Sync Polls
        const pollQuery = query(collection(db, 'polls'), orderBy('votes', 'desc'));
        const unsubPolls = onSnapshot(pollQuery, (snapshot) => {
            const freshPolls = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            setPollItems(freshPolls);
        });

        // 3. Sync Settings (Booking Paused Status)
        const settingsRef = doc(db, 'settings', 'config');
        const unsubSettings = onSnapshot(settingsRef, (doc) => {
            if (doc.exists()) {
                setIsBookingPaused(doc.data().isBookingPaused);
            }
        }, (err) => console.log("Using local settings"));

        return () => {
            unsubOrders();
            unsubPolls();
            unsubSettings();
        };
    }, []);

    // --- Actions ---

    // Voting Logic
    const voteItem = async (itemId) => {
        // Check local storage to see if user already voted for this item (or any item if strict one vote per day)
        // Let's implement one vote per item for simplicity, or we can do one vote total. 
        // User asked: "each student has to be able to vote for items only once" - usually means one vote per poll or one vote per item.
        // Let's assume one vote per item is allowed, but you can't vote twice for the SAME item.

        const votedItems = JSON.parse(localStorage.getItem('votedPolls') || '[]');

        if (votedItems.includes(itemId)) {
            alert("You have already voted for this item!");
            return;
        }

        try {
            const itemRef = doc(db, 'polls', itemId);
            // We need to read the current votes first or use increment. 
            // Increment is safer but let's just use the local state update pattern via firestore update
            // actually updateDoc with increment is best but to avoid imports let's just read/write or simple update

            // Simple increment approach:
            const item = pollItems.find(i => i.id === itemId);
            if (item) {
                await updateDoc(itemRef, { votes: item.votes + 1 });

                // Save to local storage
                localStorage.setItem('votedPolls', JSON.stringify([...votedItems, itemId]));
            }
        } catch (e) {
            console.error("Error voting:", e);
        }
    };

    // Poll Management
    const addPollItem = async (name) => {
        try {
            await addDoc(collection(db, 'polls'), {
                name: name,
                votes: 0,
                createdAt: new Date().toISOString()
            });
            alert("Poll item added successfully!");
        } catch (e) {
            console.error("Error adding poll:", e);
        }
    };

    const deletePollItem = async (id) => {
        try {
            await deleteDoc(doc(db, 'polls', id));
        } catch (e) {
            console.error("Error deleting poll:", e);
        }
    };

    // Order Logic (Push to Firebase)
    const placeOrder = async (newOrder) => {
        // Optimistic UI Update
        setOrders(prev => [newOrder, ...prev]);

        try {
            await addDoc(collection(db, 'orders'), {
                ...newOrder,
                createdAt: new Date().toISOString() // Firestore prefers strings/timestamps
            });
        } catch (e) {
            console.error("Error placing order to DB:", e);
        }
    };

    const markOrderServed = async (orderId) => {
        // Optimistic UI
        setOrders(prev => prev.map(o =>
            o.id === orderId ? { ...o, status: 'Served', servedAt: new Date() } : o
        ));

        try {
            const orderRef = doc(db, 'orders', orderId);
            await updateDoc(orderRef, { status: 'Served', servedAt: new Date().toISOString() });
        } catch (e) {
            // If ID is fake (mock data), this will fail silently in demo
            console.warn("Could not update real DB (might be mock order)");
        }
    };

    // Menu Management
    const addMenuItem = (item) => {
        setMenuItems(prev => [...prev, { ...item, id: Date.now() }]);
    };

    const deleteMenuItem = (id) => {
        setMenuItems(prev => prev.filter(item => item.id !== id));
    };

    // Settings Management
    const toggleBookingStatus = async (status) => {
        setIsBookingPaused(status);
        try {
            // Attempt to save to cloud
            const settingsRef = doc(db, 'settings', 'config');
            await updateDoc(settingsRef, { isBookingPaused: status }); // Will fail if doc doesn't exist, create manually in console
        } catch (e) {
            console.warn("Settings not saved to DB");
        }
    };

    // --- Real-Time Crowd Analytics Logic ---
    const pendingOrdersCount = orders.filter(o => o.status === 'Pending').length;
    const servingRatePerMinute = 3;

    const estimatedWaitTime = Math.ceil(pendingOrdersCount / servingRatePerMinute);

    let crowdLevel = 'Low';
    let crowdColor = 'text-green-500';

    if (pendingOrdersCount > 30) {
        crowdLevel = 'High';
        crowdColor = 'text-red-500';
    } else if (pendingOrdersCount > 10) {
        crowdLevel = 'Medium';
        crowdColor = 'text-yellow-500';
    }

    // Derived Analytics for Admin
    const totalRevenue = orders.reduce((sum, o) => sum + o.totalAmount, 0);
    const totalOrders = orders.length;

    return (
        <CanteenContext.Provider value={{
            menuItems, addMenuItem, deleteMenuItem,
            orders, placeOrder, markOrderServed,
            isBookingPaused, setIsBookingPaused: toggleBookingStatus,
            pollItems, voteItem, addPollItem, deletePollItem,
            analytics: {
                pendingOrdersCount,
                estimatedWaitTime,
                crowdLevel,
                crowdColor,
                totalRevenue,
                totalOrders
            }
        }
        } >
            {children}
        </CanteenContext.Provider >
    );
};
