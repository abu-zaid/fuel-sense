import type { FuelEntry, Vehicle } from './types';

export function exportToCSV(entries: FuelEntry[], vehicle: Vehicle | null, filename: string) {
  const headers = [
    'Date',
    'Odometer',
    'Fuel Amount',
    'Petrol Price',
    'Distance',
    'Fuel Used',
    'Efficiency (km/l)',
  ];

  const rows = entries.map((entry) => [
    new Date(entry.created_at).toLocaleDateString('en-US'),
    entry.odo,
    entry.amount.toFixed(2),
    entry.petrol_price.toFixed(2),
    entry.distance.toFixed(2),
    entry.fuel_used.toFixed(2),
    entry.efficiency.toFixed(2),
  ]);

  const csvContent = [
    `Vehicle: ${vehicle?.name || 'All Vehicles'}`,
    `Type: ${vehicle?.type || 'N/A'}`,
    `Export Date: ${new Date().toLocaleDateString('en-US')}`,
    '',
    headers.join(','),
    ...rows.map((row) => row.join(',')),
  ]
    .join('\n');

  const element = document.createElement('a');
  element.setAttribute('href', `data:text/csv;charset=utf-8,${encodeURIComponent(csvContent)}`);
  element.setAttribute('download', filename);
  element.style.display = 'none';
  document.body.appendChild(element);
  element.click();
  document.body.removeChild(element);
}

export function exportAllVehiclesToCSV(
  entriesByVehicle: Map<string, { vehicle: Vehicle; entries: FuelEntry[] }>,
  filename: string
) {
  const headers = [
    'Vehicle',
    'Date',
    'Odometer',
    'Fuel Amount',
    'Petrol Price',
    'Distance',
    'Fuel Used',
    'Efficiency (km/l)',
  ];

  const rows: string[] = [];

  entriesByVehicle.forEach(({ vehicle, entries }) => {
    entries.forEach((entry) => {
      rows.push(
        [
          vehicle.name,
          new Date(entry.created_at).toLocaleDateString('en-US'),
          entry.odo,
          entry.amount.toFixed(2),
          entry.petrol_price.toFixed(2),
          entry.distance.toFixed(2),
          entry.fuel_used.toFixed(2),
          entry.efficiency.toFixed(2),
        ].join(',')
      );
    });
  });

  const csvContent = [
    `Export Date: ${new Date().toLocaleDateString('en-US')}`,
    '',
    headers.join(','),
    ...rows,
  ]
    .join('\n');

  const element = document.createElement('a');
  element.setAttribute('href', `data:text/csv;charset=utf-8,${encodeURIComponent(csvContent)}`);
  element.setAttribute('download', filename);
  element.style.display = 'none';
  document.body.appendChild(element);
  element.click();
  document.body.removeChild(element);
}
