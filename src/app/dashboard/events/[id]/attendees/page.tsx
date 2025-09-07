"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";
import RouteProtection from "@/components/RouteProtection";
import { Skeleton } from "@/components/Skeleton";
import api from "@/lib/api";

interface Attendee {
  id: number;
  user: {
    id: number;
    name: string;
    email: string;
  };
  ticketType?: {
    id: number;
    name: string;
  };
  quantity: number;
  totalPaidIDR: number;
  createdAt: string;
}

export default function AttendeesPage() {
  const params = useParams();
  const router = useRouter();
  const eventId = Number(params.id);
  const [attendees, setAttendees] = useState<Attendee[]>([]);
  const [loading, setLoading] = useState(true);
  const [eventTitle, setEventTitle] = useState("");

  useEffect(() => {
    const fetchAttendees = async () => {
      try {
        const eventResponse = await api.get(`/events/${eventId}`);
        setEventTitle(eventResponse.data?.title || "Event");
        
        const attendeesResponse = await api.get(`/transactions/event/${eventId}/attendees`);
        const raw = attendeesResponse.data;
        const list = Array.isArray(raw) ? raw : (raw?.data && Array.isArray(raw.data) ? raw.data : []);
        setAttendees(list);
      } catch (error) {
        console.error('Failed to fetch attendees:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchAttendees();
  }, [eventId]);



  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-primary">
        <Navbar />
        <div className="container-hero">
          <div className="text-center mb-16">
            <div className="hero-badge mb-8">
              <span className="text-yellow-400 mr-3">⏳</span>
              <span className="text-white text-lg font-medium">Loading Attendees...</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <RouteProtection requiredRole="ORGANIZER">
      <div className="min-h-screen bg-gradient-primary">
        <Navbar />

        {/* Hero */}
        <div className="relative overflow-hidden">
          <div className="absolute inset-0">
            <div className="absolute top-20 left-10 w-72 h-72 bg-purple-500 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-blob"></div>
            <div className="absolute top-40 right-10 w-72 h-72 bg-yellow-500 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-blob animation-delay-2000"></div>
            <div className="absolute -bottom-8 left-20 w-72 h-72 bg-pink-500 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-blob animation-delay-4000"></div>
          </div>

          <div className="relative z-10 container-hero">
            <div className="text-center mb-16">
              <div className="hero-badge mb-8">
                <span className="text-yellow-400 mr-3">👥</span>
                <span className="text-white text-lg font-medium">Attendees</span>
              </div>
              <h1 className="hero-title text-5xl md:text-6xl mb-6">
                <span className="text-gradient">{eventTitle}</span>
              </h1>
              <p className="hero-subtitle text-xl md:text-2xl max-w-3xl mx-auto">
                View attendee list and revenue summary
              </p>
            </div>
          </div>
        </div>

        <div className="container-section">
          <div className="glass-card">
            <h2 className="text-2xl font-bold text-white mb-6">Attendees List</h2>
            {attendees.length === 0 ? (
              <div className="text-center py-12">
                <div className="text-6xl mb-4">👥</div>
                <h3 className="text-xl font-semibold text-white mb-2">No Attendees Yet</h3>
                <p className="text-white/80">This event doesn't have any attendees yet.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full text-left text-white/90">
                  <thead className="text-white/70 border-b border-white/10">
                    <tr>
                      <th className="py-3">Name</th>
                      <th className="py-3">Email</th>
                      <th className="py-3">Ticket Type</th>
                      <th className="py-3">Quantity</th>
                      <th className="py-3">Total Paid</th>
                    </tr>
                  </thead>
                  <tbody>
                    {attendees.map((attendee) => (
                      <tr key={attendee.id} className="hover:bg-white/5 transition-colors">
                        <td className="py-3 font-semibold">{attendee.user.name}</td>
                        <td className="py-3 text-white/80">{attendee.user.email}</td>
                        <td className="py-3 text-white/80">{attendee.ticketType?.name || 'General Admission'}</td>
                        <td className="py-3 text-center">{(attendee as any).quantity ?? 1}</td>
                        <td className="py-3 font-bold">IDR {(((attendee as any).totalPaidIDR) || 0).toLocaleString('id-ID')}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {attendees.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
              <div className="glass-card text-center">
                <div className="text-3xl font-bold text-white mb-2">{attendees.length}</div>
                <div className="text-white/80">Total Attendees</div>
              </div>
              <div className="glass-card text-center">
                <div className="text-3xl font-bold text-white mb-2">{attendees.reduce((sum, a) => sum + ((a as any).quantity || 1), 0)}</div>
                <div className="text-white/80">Total Tickets</div>
              </div>
              <div className="glass-card text-center">
                <div className="text-3xl font-bold text-white mb-2">IDR {attendees.reduce((sum, a) => sum + (((a as any).totalPaidIDR) || 0), 0).toLocaleString('id-ID')}</div>
                <div className="text-white/80">Total Revenue</div>
              </div>
            </div>
          )}
        </div>
      </div>
    </RouteProtection>
  );
}
