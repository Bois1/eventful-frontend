import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { eventService } from '../services/eventService';
import { Event } from '../types';
import { FiCalendar, FiMapPin, FiUsers, FiEye, FiEdit, FiPlay, FiBarChart, FiTrash } from 'react-icons/fi';
import { format } from 'date-fns';

export default function Dashboard() {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [publishingId, setPublishingId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

 
  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await eventService.getMyEvents();
      setEvents(response.data || []);
    } catch (err: any) {
      console.error('Failed to fetch events:', err);
      setError(err.response?.data?.error || 'Failed to load your events. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handlePublish = async (eventId: string) => {
    if (!window.confirm('Publish this event? It will become visible to all users.')) return;
    
    setPublishingId(eventId);
    try {
      await eventService.publishEvent(eventId);
     
      setEvents(prev => 
        prev.map(e => e.id === eventId ? { ...e, status: 'PUBLISHED' } : e)
      );
      alert('Event published successfully!');
    } catch (err: any) {
      alert(err.response?.data?.error || 'Failed to publish event');
    } finally {
      setPublishingId(null);
    }
  };

  const handleDelete = async (eventId: string, eventTitle: string) => {
    if (!window.confirm(`Delete "${eventTitle}"? This action cannot be undone.`)) return;
    
    setDeletingId(eventId);
    try {
      await eventService.deleteEvent(eventId);
      setEvents(prev => prev.filter(e => e.id !== eventId));
      alert('Event deleted successfully!');
    } catch (err: any) {
      alert(err.response?.data?.error || 'Failed to delete event');
    } finally {
      setDeletingId(null);
    }
  };

  const getStatusBadge = (status: string) => {
    const styles = {
      DRAFT: 'bg-gray-100 text-gray-800',
      PUBLISHED: 'bg-green-100 text-green-800',
      CANCELLED: 'bg-red-100 text-red-800',
      COMPLETED: 'bg-blue-100 text-blue-800'
    };
    return (
      <span className={`px-3 py-1 rounded-full text-xs font-medium ${styles[status as keyof typeof styles] || styles.DRAFT}`}>
        {status.charAt(0) + status.slice(1).toLowerCase()}
      </span>
    );
  };

  const getTicketsDisplay = (event: Event) => {
    if (event.status === 'DRAFT') return 'Not published';
    if (event.ticketsSold === undefined) return `${event.capacity} capacity`;
    return `${event.ticketsSold} / ${event.capacity} sold`;
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
          <p className="mt-4 text-gray-600">Loading your events...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
    
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Organizer Dashboard</h1>
          <p className="text-gray-600 mt-1">Manage your events and track performance</p>
        </div>
        <Link
          to="/create-event"
          className="mt-4 md:mt-0 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
        >
          <FiPlay className="mr-2" /> Create New Event
        </Link>
      </div>

     
      {error && (
        <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-start">
          <FiTrash className="mr-2 mt-0.5 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

    
      <div className="bg-white shadow rounded-lg overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">
            Your Events ({events.length})
          </h2>
        </div>

        {events.length === 0 ? (
          <div className="text-center py-12 px-4">
            <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-primary-100">
              <FiCalendar className="h-6 w-6 text-primary-600" />
            </div>
            <h3 className="mt-4 text-lg font-medium text-gray-900">No events yet</h3>
            <p className="mt-2 text-gray-500">
              Create your first event to start selling tickets and engaging with attendees.
            </p>
            <div className="mt-6">
              <Link
                to="/create-event"
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary-600 hover:bg-primary-700"
              >
                <FiPlay className="mr-2" /> Create Your First Event
              </Link>
            </div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Event</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date & Location</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tickets</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {events.map((event) => (
                  <tr key={event.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-start">
                        <div className="flex-shrink-0 h-10 w-10 bg-primary-100 rounded-md flex items-center justify-center">
                          <span className="text-primary-600 font-bold">{event.title.charAt(0)}</span>
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">{event.title}</div>
                          {event.description && (
                            <div className="text-sm text-gray-500 line-clamp-1">{event.description}</div>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {format(new Date(event.startTime), 'MMM dd, yyyy HH:mm')}
                      </div>
                      <div className="text-sm text-gray-500 flex items-center mt-1">
                        <FiMapPin className="mr-1 h-3 w-3" />
                        {event.location}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getStatusBadge(event.status)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900 flex items-center">
                        <FiUsers className="mr-1 h-4 w-4 text-gray-400" />
                        {getTicketsDisplay(event)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-3">
                        <Link
                          to={`/events/${event.id}`}
                          className="text-primary-600 hover:text-primary-900 flex items-center"
                          title="View Event"
                        >
                          <FiEye className="h-4 w-4 mr-1" /> View
                        </Link>
                        
                        {event.status === 'DRAFT' && (
                          <>
                            <button
                              onClick={() => handlePublish(event.id)}
                              disabled={publishingId === event.id}
                              className={`${
                                publishingId === event.id 
                                  ? 'text-gray-400 cursor-not-allowed' 
                                  : 'text-green-600 hover:text-green-900'
                              } flex items-center`}
                              title="Publish Event"
                            >
                              {publishingId === event.id ? (
                                <span className="inline-block animate-spin rounded-full h-3 w-3 border-b-2 border-green-600 mr-1"></span>
                              ) : (
                                <FiPlay className="h-4 w-4 mr-1" />
                              )}
                              Publish
                            </button>
                            <Link
                              to={`/create-event?edit=${event.id}`}
                              className="text-blue-600 hover:text-blue-900 flex items-center"
                              title="Edit Event"
                            >
                              <FiEdit className="h-4 w-4 mr-1" /> Edit
                            </Link>
                          </>
                        )}
                        
                        {event.status === 'PUBLISHED' && (
                          <Link
                            to={`/analytics/event/${event.id}`}
                            className="text-purple-600 hover:text-purple-900 flex items-center"
                            title="View Analytics"
                          >
                            <FiBarChart className="h-4 w-4 mr-1" /> Analytics
                          </Link>
                        )}
                        
                        <button
                          onClick={() => handleDelete(event.id, event.title)}
                          disabled={deletingId === event.id}
                          className={`${
                            deletingId === event.id
                              ? 'text-gray-400 cursor-not-allowed'
                              : 'text-red-600 hover:text-red-900'
                          } flex items-center`}
                          title="Delete Event"
                        >
                          {deletingId === event.id ? (
                            <span className="inline-block animate-spin rounded-full h-3 w-3 border-b-2 border-red-600 mr-1"></span>
                          ) : (
                            <FiTrash className="h-4 w-4 mr-1" />
                          )}
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      
      {events.length > 0 && (
        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="h-12 w-12 rounded-full bg-primary-100 flex items-center justify-center">
                    <FiCalendar className="h-6 w-6 text-primary-600" />
                  </div>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">Total Events</dt>
                    <dd className="flex items-baseline">
                      <div className="text-2xl font-semibold text-gray-900">{events.length}</div>
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>
          
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="h-12 w-12 rounded-full bg-green-100 flex items-center justify-center">
                    <FiUsers className="h-6 w-6 text-green-600" />
                  </div>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">Published Events</dt>
                    <dd className="flex items-baseline">
                      <div className="text-2xl font-semibold text-gray-900">
                        {events.filter(e => e.status === 'PUBLISHED').length}
                      </div>
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>
          
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center">
                    <FiPlay className="h-6 w-6 text-blue-600" />
                  </div>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">Draft Events</dt>
                    <dd className="flex items-baseline">
                      <div className="text-2xl font-semibold text-gray-900">
                        {events.filter(e => e.status === 'DRAFT').length}
                      </div>
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Help Section */}
      <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-blue-900 mb-2">Dashboard Tips</h3>
        <ul className="space-y-2 text-blue-800 text-sm">
          <li className="flex items-start">
            <span className="mr-2 mt-1">•</span>
            <span><strong>Draft events</strong> are only visible to you. Click "Publish" to make them available to attendees.</span>
          </li>
          <li className="flex items-start">
            <span className="mr-2 mt-1">•</span>
            <span>Track ticket sales and attendance in the <strong>Analytics</strong> section for published events.</span>
          </li>
          <li className="flex items-start">
            <span className="mr-2 mt-1">•</span>
            <span>Events automatically show in the public event list once published.</span>
          </li>
        </ul>
      </div>
    </div>
  );
}