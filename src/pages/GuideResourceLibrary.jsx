import React, { useState, useEffect } from 'react';
import { collection, query, limit, getDocs } from 'firebase/firestore';
import { db } from '../services/firebase';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import DesktopLayoutWrapper from '../components/layout/DesktopLayoutWrapper';
import SEO from '../components/common/SEO';
import { Card } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { Badge } from '../components/common/Badge';
import { Search, Filter, BookOpen, Video, FileText, CheckCircle, Heart, Plus, FolderHeart, LayoutGrid, List } from 'lucide-react';

export default function GuideResourceLibrary() {
    const navigate = useNavigate();
    const { currentUser } = useAuth();
    const [searchQuery, setSearchQuery] = useState('');
    const [activeCategory, setActiveCategory] = useState('All');
    const [viewMode, setViewMode] = useState('grid');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const [resources, setResources] = useState([]);
    const [protocols, setProtocols] = useState([]);
    const categories = ['All', 'Mental Health', 'Cardiology', 'Physiotherapy', 'Nutrition', 'General'];

    useEffect(() => {
        if (!currentUser) return;

        const fetchLibraryData = async () => {
            setLoading(true);
            setError(null);
            try {
                // Fetch Global Resources
                const resQ = query(collection(db, 'resources'), limit(50));
                const resSnap = await getDocs(resQ);
                const fetchedResources = resSnap.docs.map(d => ({ id: d.id, ...d.data() }));

                // Fetch Pre-built Protocols
                const protoQ = query(collection(db, 'protocols'), limit(20));
                const protoSnap = await getDocs(protoQ);
                const fetchedProtocols = protoSnap.docs.map(d => ({ id: d.id, ...d.data() }));

                setResources(fetchedResources);
                setProtocols(fetchedProtocols);
            } catch (err) {
                console.error("Library Fetch Error:", err);
                setError("Unable to connect to the clinical library. Please check your connection.");
            } finally {
                setLoading(false);
            }
        };

        fetchLibraryData();
    }, [currentUser]);

    const filteredResources = resources.filter(res => 
        (activeCategory === 'All' || res.specialty === activeCategory) &&
        res.title.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const getIcon = (type) => {
        switch(type) {
            case 'reading': return <BookOpen className="w-5 h-5 text-purple-500" />;
            case 'video': return <Video className="w-5 h-5 text-blue-500" />;
            case 'worksheet': return <FileText className="w-5 h-5 text-orange-500" />;
            default: return <FileText className="w-5 h-5 text-gray-500" />;
        }
    };

    if (loading) {
        return (
            <DesktopLayoutWrapper hideNav>
                <div className="min-h-screen flex items-center justify-center bg-gray-50">
                    <div className="animate-pulse flex flex-col items-center">
                        <div className="w-12 h-12 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin mb-4"></div>
                        <p className="text-gray-500 font-bold">Loading Clinical Library...</p>
                    </div>
                </div>
            </DesktopLayoutWrapper>
        );
    }

    if (error) {
        return (
            <DesktopLayoutWrapper hideNav>
                <div className="min-h-screen flex items-center justify-center bg-gray-50 p-6">
                    <Card className="max-w-md w-full p-8 text-center border-red-200 bg-red-50">
                        <BookOpen className="w-12 h-12 text-red-500 mx-auto mb-4" />
                        <h2 className="text-xl font-bold text-gray-900 mb-2">Connection Error</h2>
                        <p className="text-sm text-gray-600">{error}</p>
                    </Card>
                </div>
            </DesktopLayoutWrapper>
        );
    }

    return (
        <DesktopLayoutWrapper hideNav>
            <SEO title="Resource Library | Professional OS" />
            <div className="min-h-screen bg-[#fafafa] flex">
                
                {/* Left Navigation (Library Context) */}
                <div className="w-64 bg-white border-r border-gray-200 p-6 flex flex-col gap-6 hidden lg:flex">
                    <h2 className="text-xl font-black text-gray-900">Clinical Library</h2>
                    
                    <div className="space-y-1">
                        <button className="w-full flex items-center gap-3 px-4 py-2 bg-indigo-50 text-indigo-700 font-bold rounded-lg transition-colors">
                            <BookOpen className="w-4 h-4" /> Master Library
                        </button>
                        <button className="w-full flex items-center gap-3 px-4 py-2 text-gray-600 hover:bg-gray-50 font-medium rounded-lg transition-colors">
                            <FolderHeart className="w-4 h-4" /> My Favorites
                        </button>
                        <button className="w-full flex items-center gap-3 px-4 py-2 text-gray-600 hover:bg-gray-50 font-medium rounded-lg transition-colors">
                            <CheckCircle className="w-4 h-4" /> Custom Protocols
                        </button>
                    </div>

                    <hr className="border-gray-200" />

                    <div>
                        <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Specialties</h3>
                        <div className="space-y-1">
                            {categories.map(cat => (
                                <button 
                                    key={cat}
                                    onClick={() => setActiveCategory(cat)}
                                    className={`w-full text-left px-3 py-1.5 text-sm rounded-md transition-colors ${activeCategory === cat ? 'bg-gray-100 font-bold text-gray-900' : 'text-gray-500 hover:bg-gray-50'}`}
                                >
                                    {cat}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Main Content Area */}
                <div className="flex-1 p-6 md:p-10 overflow-y-auto">
                    
                    {/* Search & Header */}
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
                        <div className="relative w-full md:w-96">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                            <input 
                                type="text" 
                                placeholder="Search resources, tags, or protocols..." 
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-all shadow-sm"
                            />
                        </div>
                        <div className="flex items-center gap-3">
                            <div className="bg-white border border-gray-200 rounded-lg p-1 flex">
                                <button onClick={() => setViewMode('grid')} className={`p-1.5 rounded ${viewMode === 'grid' ? 'bg-gray-100 text-gray-900' : 'text-gray-400 hover:text-gray-600'}`}>
                                    <LayoutGrid className="w-4 h-4" />
                                </button>
                                <button onClick={() => setViewMode('list')} className={`p-1.5 rounded ${viewMode === 'list' ? 'bg-gray-100 text-gray-900' : 'text-gray-400 hover:text-gray-600'}`}>
                                    <List className="w-4 h-4" />
                                </button>
                            </div>
                            <Button variant="primary" className="bg-indigo-600 hover:bg-indigo-700" disabled title="Coming soon">
                                <Plus className="w-4 h-4 mr-2" /> Build Protocol (Coming Soon)
                            </Button>
                        </div>
                    </div>

                    {/* Pre-built Protocols Section (Only show when searching or in 'All', and
                        only if there are any — no real content exists yet, so this section
                        stays hidden entirely rather than showing a header over nothing) */}
                    {(activeCategory === 'All' && !searchQuery && protocols.length > 0) && (
                        <div className="mb-10">
                            <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                                <CheckCircle className="w-5 h-5 text-green-500" /> Recommended Protocols
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {protocols.map(protocol => (
                                    <Card key={protocol.id} className="p-5 border-gray-200 hover:border-indigo-300 hover:shadow-md transition-all cursor-pointer">
                                        <div className="flex justify-between items-start mb-2">
                                            <h4 className="font-bold text-gray-900">{protocol.title}</h4>
                                            <Badge variant="secondary" className="bg-indigo-50 text-indigo-700 border-none">{protocol.steps} Steps</Badge>
                                        </div>
                                        <p className="text-sm text-gray-500 mb-4">A complete care journey designed to span {protocol.duration}.</p>
                                        <div className="flex justify-between items-center">
                                            <span className="text-xs font-medium text-gray-400">By {protocol.author}</span>
                                            <Button variant="outline" size="sm" className="text-xs py-1.5" disabled title="Coming soon">Preview Protocol</Button>
                                        </div>
                                    </Card>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Master Resources Grid */}
                    <div>
                        <h3 className="text-lg font-bold text-gray-900 mb-4">Resources</h3>
                        
                        {filteredResources.length === 0 ? (
                            <div className="text-center py-12 bg-white border border-dashed border-gray-300 rounded-xl">
                                <Search className="w-10 h-10 text-gray-300 mx-auto mb-3" />
                                <h4 className="text-gray-900 font-bold mb-1">No resources found</h4>
                                <p className="text-sm text-gray-500">Try adjusting your search or category filter.</p>
                            </div>
                        ) : (
                            <div className={`grid gap-4 ${viewMode === 'grid' ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3' : 'grid-cols-1'}`}>
                                {filteredResources.map(res => (
                                    <Card key={res.id} className={`bg-white border-gray-200 hover:border-gray-300 transition-all cursor-pointer group ${viewMode === 'list' ? 'flex items-center p-4' : 'p-5 flex flex-col h-full'}`}>
                                        <div className={`flex items-start gap-3 ${viewMode === 'grid' ? 'mb-4' : 'flex-1'}`}>
                                            <div className="w-10 h-10 rounded-lg bg-gray-50 border border-gray-100 flex items-center justify-center shrink-0">
                                                {getIcon(res.type)}
                                            </div>
                                            <div className="flex-1">
                                                <div className="flex justify-between items-start">
                                                    <h4 className="font-bold text-gray-900 leading-tight mb-1 group-hover:text-indigo-600 transition-colors">{res.title}</h4>
                                                    <button className="text-gray-300 cursor-not-allowed ml-2" disabled title="Coming soon">
                                                        <Heart className={`w-4 h-4 ${res.isFavorite ? 'fill-red-500 text-red-500' : ''}`} />
                                                    </button>
                                                </div>
                                                <p className="text-xs text-gray-500 flex items-center gap-2">
                                                    <span className="capitalize">{res.type}</span>
                                                    <span>•</span>
                                                    <span>{res.duration}</span>
                                                </p>
                                            </div>
                                        </div>
                                        
                                        <div className={`${viewMode === 'grid' ? 'mt-auto pt-4 border-t border-gray-100' : 'ml-4'} flex items-center justify-between`}>
                                            <div className="flex flex-wrap gap-1">
                                                {(res.tags || []).map((tag, i) => (
                                                    <Badge key={i} variant="secondary" className="bg-gray-50 text-gray-600 text-[10px] px-1.5 py-0 border-gray-200">{tag}</Badge>
                                                ))}
                                            </div>
                                            <Button variant="outline" size="sm" className="text-xs px-2 py-1 bg-white hover:bg-gray-50" disabled title="Coming soon">Assign</Button>
                                        </div>
                                    </Card>
                                ))}
                            </div>
                        )}
                    </div>

                </div>
            </div>
        </DesktopLayoutWrapper>
    );
}
