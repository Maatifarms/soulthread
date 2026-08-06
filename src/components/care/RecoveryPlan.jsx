// RecoveryPlan.jsx — Post-Session Care Plan & Recovery Checklist
import React, { useState, useEffect } from 'react';
import { collection, query, where, onSnapshot, doc, updateDoc } from 'firebase/firestore';
import { db } from '../../services/firebase';
import { useAuth } from '../../contexts/AuthContext';
import { CheckCircle2, Circle, BookOpen, Stethoscope, Sparkles, Calendar, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Card } from '../common/Card';
import { Badge } from '../common/Badge';
import { Button } from '../common/Button';

export default function RecoveryPlan() {
    const { currentUser } = useAuth();
    const [recoveryPlans, setRecoveryPlans] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (!currentUser) return;

        const q = query(
            collection(db, 'session_notes_and_recovery'),
            where('userId', '==', currentUser.uid)
        );

        const unsubscribe = onSnapshot(q, (snap) => {
            const list = snap.docs.map(d => ({ id: d.id, ...d.data() }));
            setRecoveryPlans(list);
            setLoading(false);
        }, (err) => {
            console.error('Error fetching recovery plan:', err);
            setLoading(false);
        });

        return () => unsubscribe();
    }, [currentUser]);

    const toggleTask = async (planId, taskIdx) => {
        const plan = recoveryPlans.find(p => p.id === planId);
        if (!plan || !plan.tasks) return;

        const updatedTasks = [...plan.tasks];
        updatedTasks[taskIdx].completed = !updatedTasks[taskIdx].completed;

        try {
            setError(null);
            await updateDoc(doc(db, 'session_notes_and_recovery', planId), {
                tasks: updatedTasks
            });
        } catch (err) {
            console.error('Error updating task:', err);
            setError('Failed to update task. Please try again.');
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center p-8 bg-gray-50 rounded-xl animate-pulse" aria-busy="true">
                <span className="text-gray-500 font-medium">Loading your personalized recovery plan...</span>
            </div>
        );
    }

    if (recoveryPlans.length === 0) {
        return (
            <Card className="flex flex-col items-center justify-center p-8 text-center bg-white border-dashed border-2 border-gray-200">
                <div className="w-16 h-16 bg-indigo-50 rounded-full flex items-center justify-center mb-4 text-indigo-500">
                    <Stethoscope size={32} aria-hidden="true" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">Your Active Recovery Plan</h3>
                <p className="text-gray-500 max-w-md mx-auto mb-6">
                    Complete a session with a verified psychologist on SoulThread to receive your custom post-session recovery tasks, grounding audio series, and clinical exercises.
                </p>
                <Button as={Link} to="/experts" variant="primary">
                    Find Verified Psychologist <ArrowRight size={16} className="ml-2" aria-hidden="true" />
                </Button>
            </Card>
        );
    }

    return (
        <section className="space-y-6" aria-labelledby="recovery-plan-heading">
            <div>
                <h2 id="recovery-plan-heading" className="text-2xl font-bold text-gray-900">Personalized Care & Recovery Plan</h2>
                <p className="text-gray-500 mt-1">Daily self-care tasks and recommendations assigned by your clinical guide.</p>
            </div>
            
            {error && (
                <div className="p-4 bg-red-50 text-red-700 rounded-lg border border-red-200" role="alert">
                    {error}
                </div>
            )}

            <div className="space-y-6">
                {recoveryPlans.map(plan => (
                    <Card key={plan.id} className="overflow-hidden border-gray-200 shadow-sm">
                        <div className="bg-gray-50 border-b border-gray-100 p-4 flex justify-between items-center">
                            <Badge variant="secondary" className="flex items-center gap-1.5 text-indigo-700 bg-indigo-50 border-indigo-100">
                                <Stethoscope size={14} aria-hidden="true" /> Assigned by {plan.guideName || 'Clinical Psychologist'}
                            </Badge>
                            <span className="text-sm font-medium text-gray-500">{plan.date || 'Active Plan'}</span>
                        </div>

                        <div className="p-5 space-y-6">
                            {plan.clinicalAdvice && (
                                <div className="p-4 bg-orange-50 border border-orange-100 rounded-xl text-orange-900">
                                    <strong className="block text-sm mb-1 uppercase tracking-wider text-orange-700">Clinical Note:</strong>
                                    <p className="text-sm leading-relaxed">{plan.clinicalAdvice}</p>
                                </div>
                            )}

                            {plan.tasks && plan.tasks.length > 0 && (
                                <div>
                                    <h4 className="font-bold text-gray-900 mb-3 text-sm uppercase tracking-wider">Daily Recovery Checklist</h4>
                                    <div className="space-y-2">
                                        {plan.tasks.map((task, idx) => (
                                            <button 
                                                key={idx} 
                                                className={`w-full flex items-center gap-3 p-4 rounded-xl border text-left transition-all ${
                                                    task.completed 
                                                    ? 'bg-green-50 border-green-200 text-green-900' 
                                                    : 'bg-white border-gray-200 hover:border-indigo-300 text-gray-700 hover:bg-indigo-50'
                                                }`}
                                                onClick={() => toggleTask(plan.id, idx)}
                                                aria-pressed={task.completed}
                                            >
                                                <div className="flex-shrink-0">
                                                    {task.completed ? (
                                                        <CheckCircle2 size={22} className="text-green-600" aria-hidden="true" />
                                                    ) : (
                                                        <Circle size={22} className="text-gray-300" aria-hidden="true" />
                                                    )}
                                                </div>
                                                <span className={`font-medium ${task.completed ? 'line-through opacity-70' : ''}`}>
                                                    {task.text || task}
                                                </span>
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {plan.recommendedArticles && plan.recommendedArticles.length > 0 && (
                                <div>
                                    <h4 className="font-bold text-gray-900 mb-3 text-sm uppercase tracking-wider">Recommended Medical Guides</h4>
                                    <div className="grid gap-3 sm:grid-cols-2">
                                        {plan.recommendedArticles.map((art, idx) => (
                                            <Link 
                                                key={idx} 
                                                to={art.link || '/resources'} 
                                                className="flex items-center justify-between p-3 rounded-lg border border-gray-200 hover:border-indigo-300 hover:bg-indigo-50 group transition-colors"
                                            >
                                                <div className="flex items-center gap-2 overflow-hidden text-gray-700 group-hover:text-indigo-700">
                                                    <BookOpen size={16} className="flex-shrink-0" aria-hidden="true" />
                                                    <span className="font-medium text-sm truncate">{art.title || art}</span>
                                                </div>
                                                <ArrowRight size={14} className="text-gray-400 group-hover:text-indigo-500 flex-shrink-0" aria-hidden="true" />
                                            </Link>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    </Card>
                ))}
            </div>
        </section>
    );
}
