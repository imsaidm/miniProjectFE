// src/components/Hero.tsx
export default function Hero() {
    return (
        <section className="relative w-full h-[400px] bg-gradient-to-r from-blue-600 to-purple-600 flex items-center justify-center text-center text-white">
            <div className="max-w-2xl px-4">
                <h2 className="text-4xl font-bold mb-4">
                    Discover & Join Exciting Events Near You
                </h2>
                <p className="mb-6">
                    Explore conferences, concerts, meetups, and more. Register easily and
                    never miss out on amazing experiences.
                </p>
                <button className="px-6 py-3 bg-white text-blue-600 rounded-lg font-semibold hover:bg-gray-100">
                    Explore Events
                </button>
            </div>
        </section>
    );
}
