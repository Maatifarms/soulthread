import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../../common/Button';
import { Badge } from '../../common/Badge';

export const AppointmentCard = ({ booking }) => {
  const navigate = useNavigate();
  // Parsing dates
  const startTime = new Date(booking.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  
  // Status logic
  const isNow = booking.status === 'in_progress';
  const isPast = booking.status === 'completed';
  
  return (
    <div className={`p-5 rounded-xl border ${isNow ? 'border-green-300 bg-green-50 shadow-sm' : 'border-gray-200 bg-white hover:border-gray-300 transition-colors'}`}>
      
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="text-lg font-bold text-gray-900">{booking.patientName || 'Patient Name'}</h3>
          <p className="text-sm text-gray-500 mt-0.5">{booking.sessionType || 'Individual Therapy'} • {booking.mode === 'video' ? 'Video Call' : 'In-Person'}</p>
        </div>
        
        <div className="text-right">
          <div className="text-lg font-semibold text-gray-900">{startTime}</div>
          <div className="text-sm text-gray-500">{booking.duration} min</div>
        </div>
      </div>

      <div className="flex justify-between items-center mt-6">
        <div className="flex space-x-2">
          {isNow ? (
            <Badge status="success">In Progress</Badge>
          ) : isPast ? (
            <Badge status="neutral">Completed</Badge>
          ) : (
            <Badge status="brand">Upcoming</Badge>
          )}
        </div>
        
        <div className="flex space-x-3">
          <Button variant="outline">View Profile</Button>
          {!isPast && (
            <Button 
              variant="primary" 
              onClick={() => navigate(`/session/${booking.id}`)}
            >
              {isNow ? 'Return to Session' : 'Join Room'}
            </Button>
          )}
          {isPast && (
            <Button variant="primary">Write Note</Button>
          )}
        </div>
      </div>

    </div>
  );
};
