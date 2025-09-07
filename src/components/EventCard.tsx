import Image from "next/image";
import { useRouter } from "next/navigation";

interface Event {
    id: number;
    title: string;
    date: string;
    location: string;
    price: string;
    image: string;
}

interface EventCardProps {
    event: Event;
}

export default function EventCard({ event }: EventCardProps) {
    const router = useRouter();

    return (
        <div className="bg-white rounded-2xl shadow-md overflow-hidden hover:shadow-lg transition">
            <div className="relative w-full h-48">
                <Image src={event.image} alt={event.title} fill className="object-cover" />
            </div>
            <div className="p-4">
                <h3 className="text-lg font-semibold">{event.title}</h3>
                <p className="text-sm text-gray-500">
                    {event.date} • {event.location}
                </p>
                <p className="mt-2 font-medium text-blue-600">{event.price}</p>
                <button
                    onClick={() => router.push(`/events/${event.id}`)}
                    className="mt-4 w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                    View Details
                </button>
            </div>
        </div>
    );
}
