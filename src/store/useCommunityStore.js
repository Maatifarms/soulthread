import { create } from 'zustand';

export const MOODS = [
    { id: 'calm', label: 'Calm', color: 'bg-blue-50 text-blue-700 border-blue-200' },
    { id: 'anxious', label: 'Anxious', color: 'bg-orange-50 text-orange-700 border-orange-200' },
    { id: 'overwhelmed', label: 'Overwhelmed', color: 'bg-red-50 text-red-700 border-red-200' },
    { id: 'hopeful', label: 'Hopeful', color: 'bg-green-50 text-green-700 border-green-200' },
    { id: 'lonely', label: 'Lonely', color: 'bg-purple-50 text-purple-700 border-purple-200' },
    { id: 'grieving', label: 'Grieving', color: 'bg-gray-50 text-gray-700 border-gray-300' },
    { id: 'healing', label: 'Healing', color: 'bg-teal-50 text-teal-700 border-teal-200' },
    { id: 'venting', label: 'Venting', color: 'bg-pink-50 text-pink-700 border-pink-200' }
];

export const COMMUNITIES = [
    { id: 'general', label: 'General Support' },
    { id: 'anxiety', label: 'Anxiety & Panic' },
    { id: 'depression', label: 'Depression' },
    { id: 'relationships', label: 'Relationships & Family' },
    { id: 'grief', label: 'Grief & Loss' },
    { id: 'recovery', label: 'Recovery Stories' },
    { id: 'adhd', label: 'ADHD & Focus' }
];

export const useCommunityStore = create((set) => ({
    feed: [],
    loading: false,
    error: null,
    
    setFeed: (posts) => set({ feed: posts }),
    addPostToFeed: (post) => set((state) => ({ feed: [post, ...state.feed] })),
    
    // UI State for the feed filters
    selectedMoodFilter: null,
    selectedCommunityFilter: 'general',
    
    setMoodFilter: (moodId) => set({ selectedMoodFilter: moodId }),
    setCommunityFilter: (communityId) => set({ selectedCommunityFilter: communityId })
}));
