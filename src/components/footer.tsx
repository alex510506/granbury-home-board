export function Footer() {
  return (
    <footer className="bg-gray-100 px-4 py-8 text-center text-sm text-muted">
      <p className="mx-auto max-w-3xl">
        Granbury Home Board connects homeowners with independent service
        providers. We do not vet, endorse, employ, or guarantee any provider or
        their work. All services are performed by independent professionals.
      </p>
      <p className="mt-4">
        &copy; {new Date().getFullYear()} Granbury Home Board &mdash; Hood
        County, TX
      </p>
    </footer>
  );
}
