import { Link } from 'react-router-dom';
import { Event } from '../../types';
import { format } from 'date-fns';
import { FiCalendar, FiMapPin } from 'react-icons/fi';
import { IoTicketOutline } from 'react-icons/io5';

interface EventCardProps {
  event: Event;
}

export default function EventCard({ event }: EventCardProps) {
  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
      <div className="p-6">
        <div className="flex justify-between items-start mb-4">
          <h3 className="text-xl font-bold text-gray-900">{event.title}</h3>
          <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
            event.status === 'PUBLISHED' ? 'bg-green-100 text-green-800' :
            event.status === 'DRAFT' ? 'bg-gray-100 text-gray-800' :
            'bg-red-100 text-red-800'
          }`}>
            {event.status}
          </span>
        </div>

        {event.description && (
          <p className="text-gray-600 mb-4 line-clamp-2">{event.description}</p>
        )}

        <div className="space-y-3 mb-4">
          <div className="flex items-center text-gray-600">
            <FiCalendar className="mr-2" />
            <span>{format(new Date(event.startTime), 'MMM dd, yyyy HH:mm')}</span>
          </div>
          <div className="flex items-center text-gray-600">
            <FiMapPin className="mr-2" />
            <span>{event.location}</span>
          </div>
          <div className="flex items-center text-gray-600">
            <IoTicketOutline className="mr-2" />
            <span>
              {event.ticketsSold || 0} / {event.capacity} tickets sold
            </span>
          </div>
        </div>

        <div className="flex justify-between items-center pt-4 border-t">
          <div>
            <span className="text-2xl font-bold text-primary-600">
              ₦{event.price.toLocaleString()}
            </span>
            {event.price === 0 && (
              <span className="text-green-600 font-semibold">FREE</span>
            )}
          </div>
          <Link
            to={`/events/${event.id}`}
            className="bg-primary-600 text-white px-6 py-2 rounded-md hover:bg-primary-700 transition-colors"
          >
            View Details
          </Link>
        </div>
      </div>
    </div>
  );
}