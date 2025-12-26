export function Footer() {
  return (
    <footer className="w-full py-8 px-6 mt-auto border-t border-gray-200 bg-white">
      <div className="max-w-7xl mx-auto">
        <div className="text-center">
          <p className="text-xs text-gray-500">
            © {new Date().getFullYear()} ErrMate.
          </p>
        </div>
      </div>
    </footer>
  );
}
