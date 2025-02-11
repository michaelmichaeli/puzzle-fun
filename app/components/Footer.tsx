export default function Footer() {
  return (
    <footer className="w-full px-4 py-6 border-t border-gray-200 mt-auto">
      <div className="container mx-auto text-center text-gray-600">
        <p>&copy; {new Date().getFullYear()} Puzzle Game. All rights reserved.</p>
      </div>
    </footer>
  );
}
