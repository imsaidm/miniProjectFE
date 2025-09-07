export default function Footer() {
  return (
    <footer className="w-full py-6 bg-gray-100 text-center text-gray-600 text-sm">
      © {new Date().getFullYear()} Eventify. All rights reserved.
    </footer>
  );
}
