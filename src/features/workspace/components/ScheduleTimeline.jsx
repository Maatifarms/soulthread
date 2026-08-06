import React from 'react';
import { AppointmentCard } from './AppointmentCard';

export const ScheduleTimeline = ({ bookings = [], isLoading }) => {
  
  if (isLoading) {
    // Skeleton loader
    return (
      <div className="space-y-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Today's Schedule</h2>
        {[1, 2, 3].map(i => (
          <div key={i} className="animate-pulse flex p-5 border border-gray-200 rounded-xl bg-gray-50">
            <div className="flex-1 space-y-4 py-1">
              <div className="h-4 bg-gray-200 rounded w-1/4"></div>
              <div className="space-y-2">
                <div className="h-4 bg-gray-200 rounded"></div>
                <div className="h-4 bg-gray-200 rounded w-5/6"></div>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (bookings.length === 0) {
    return (
      <div className="border border-dashed border-gray-300 rounded-xl p-12 text-center bg-gray-50">
        <h3 className="text-lg font-semibold text-gray-900">No scheduled sessions today</h3>
        <p className="text-sm text-gray-500 mt-2 max-w-sm mx-auto">
          You have no upcoming appointments. Use this time to review patient notes or update your availability.
        </p>
        <div className="mt-6 flex justify-center space-x-4">
          <button className="px-4 py-2 bg-white border border-gray-300 rounded-md text-sm font-medium hover:bg-gray-50">Block Time</button>
          <button className="px-4 py-2 bg-black text-white rounded-md text-sm font-medium hover:bg-gray-800">Review Patients</button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h2 className="text-lg font-semibold text-gray-900 mb-4">Today's Schedule</h2>
      
      <div className="relative border-l-2 border-gray-100 ml-3 md:ml-0 md:border-l-0 space-y-8 pl-6 md:pl-0">
        {bookings.map((booking, idx) => (
          <div key={booking.id || idx} className="relative">
            {/* Timeline dot for mobile view */}
            <span className="md:hidden absolute -left-8 top-5 w-4 h-4 rounded-full bg-white border-2 border-gray-300"></span>
            
            <AppointmentCard booking={booking} />
          </div>
        ))}
      </div>
    </div>
  );
};
