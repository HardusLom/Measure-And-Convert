import { Quantity, SiPrefix, Formula } from '../models/unit.model';

/**
 * All conversion factors are expressed relative to each quantity's base unit.
 *   base = value * factor + (offset ?? 0)
 * Only temperature uses a non-zero offset (affine conversion).
 *
 * Factors are exact where an exact definition exists (e.g. 1 inch = 0.0254 m).
 */
export const QUANTITIES: Quantity[] = [
  // ---------------------------------------------------------------- LENGTH
  {
    id: 'length', name: 'Length', symbol: 'l', category: 'Length & area', baseSymbol: 'm',
    units: [
      { id: 'nm', name: 'nanometre', symbol: 'nm', system: 'metric', factor: 1e-9 },
      { id: 'um', name: 'micrometre', symbol: 'µm', system: 'metric', factor: 1e-6 },
      { id: 'mm', name: 'millimetre', symbol: 'mm', system: 'metric', factor: 1e-3 },
      { id: 'cm', name: 'centimetre', symbol: 'cm', system: 'metric', factor: 1e-2 },
      { id: 'm', name: 'metre', symbol: 'm', system: 'metric', factor: 1 },
      { id: 'km', name: 'kilometre', symbol: 'km', system: 'metric', factor: 1000 },
      { id: 'in', name: 'inch', symbol: 'in', system: 'imperial', factor: 0.0254 },
      { id: 'ft', name: 'foot', symbol: 'ft', system: 'imperial', factor: 0.3048 },
      { id: 'yd', name: 'yard', symbol: 'yd', system: 'imperial', factor: 0.9144 },
      { id: 'mi', name: 'mile', symbol: 'mi', system: 'imperial', factor: 1609.344 },
      { id: 'nmi', name: 'nautical mile', symbol: 'nmi', system: 'other', factor: 1852 },
    ],
  },
  // ------------------------------------------------------------------ MASS
  {
    id: 'mass', name: 'Mass', symbol: 'm', category: 'Mass & force', baseSymbol: 'kg',
    units: [
      { id: 'ug', name: 'microgram', symbol: 'µg', system: 'metric', factor: 1e-9 },
      { id: 'mg', name: 'milligram', symbol: 'mg', system: 'metric', factor: 1e-6 },
      { id: 'g', name: 'gram', symbol: 'g', system: 'metric', factor: 1e-3 },
      { id: 'kg', name: 'kilogram', symbol: 'kg', system: 'metric', factor: 1 },
      { id: 't', name: 'tonne', symbol: 't', system: 'metric', factor: 1000 },
      { id: 'oz', name: 'ounce', symbol: 'oz', system: 'imperial', factor: 0.028349523125 },
      { id: 'lb', name: 'pound', symbol: 'lb', system: 'imperial', factor: 0.45359237 },
      { id: 'st', name: 'stone', symbol: 'st', system: 'imperial', factor: 6.35029318 },
      { id: 'lt', name: 'long ton', symbol: 'LT', system: 'imperial', factor: 1016.0469088 },
      { id: 'sht', name: 'short ton', symbol: 'ST', system: 'us', factor: 907.18474 },
    ],
  },
  // ------------------------------------------------------------------ FORCE
  {
    id: 'force', name: 'Force', symbol: 'F', category: 'Mass & force', baseSymbol: 'N',
    units: [
      { id: 'dyn', name: 'dyne', symbol: 'dyn', system: 'metric', factor: 1e-5 },
      { id: 'n', name: 'newton', symbol: 'N', system: 'si', factor: 1 },
      { id: 'kn', name: 'kilonewton', symbol: 'kN', system: 'si', factor: 1000 },
      { id: 'mn', name: 'meganewton', symbol: 'MN', system: 'si', factor: 1e6 },
      { id: 'kgf', name: 'kilogram-force', symbol: 'kgf', system: 'metric', factor: 9.80665 },
      { id: 'lbf', name: 'pound-force', symbol: 'lbf', system: 'imperial', factor: 4.4482216152605 },
    ],
  },
  // ------------------------------------------------------------------ AREA
  {
    id: 'area', name: 'Area', symbol: 'A', category: 'Length & area', baseSymbol: 'm²',
    units: [
      { id: 'mm2', name: 'square millimetre', symbol: 'mm²', system: 'metric', factor: 1e-6 },
      { id: 'cm2', name: 'square centimetre', symbol: 'cm²', system: 'metric', factor: 1e-4 },
      { id: 'm2', name: 'square metre', symbol: 'm²', system: 'metric', factor: 1 },
      { id: 'ha', name: 'hectare', symbol: 'ha', system: 'metric', factor: 1e4 },
      { id: 'km2', name: 'square kilometre', symbol: 'km²', system: 'metric', factor: 1e6 },
      { id: 'in2', name: 'square inch', symbol: 'in²', system: 'imperial', factor: 0.00064516 },
      { id: 'ft2', name: 'square foot', symbol: 'ft²', system: 'imperial', factor: 0.09290304 },
      { id: 'ac', name: 'acre', symbol: 'ac', system: 'imperial', factor: 4046.8564224 },
      { id: 'mi2', name: 'square mile', symbol: 'mi²', system: 'imperial', factor: 2589988.110336 },
    ],
  },
  // ----------------------------------------------------------------- VOLUME
  {
    id: 'volume', name: 'Volume', symbol: 'V', category: 'Volume & capacity', baseSymbol: 'm³',
    units: [
      { id: 'ml', name: 'millilitre', symbol: 'mL', system: 'metric', factor: 1e-6 },
      { id: 'cm3', name: 'cubic centimetre', symbol: 'cm³', system: 'metric', factor: 1e-6 },
      { id: 'l', name: 'litre', symbol: 'L', system: 'metric', factor: 1e-3 },
      { id: 'm3', name: 'cubic metre', symbol: 'm³', system: 'metric', factor: 1 },
      { id: 'kl', name: 'kilolitre', symbol: 'kL', system: 'metric', factor: 1 },
      { id: 'in3', name: 'cubic inch', symbol: 'in³', system: 'imperial', factor: 0.000016387064 },
      { id: 'ft3', name: 'cubic foot', symbol: 'ft³', system: 'imperial', factor: 0.028316846592 },
      { id: 'tsp', name: 'teaspoon (US)', symbol: 'tsp', system: 'us', factor: 0.00000492892159375 },
      { id: 'tbsp', name: 'tablespoon (US)', symbol: 'tbsp', system: 'us', factor: 0.0000147867647813 },
      { id: 'floz_us', name: 'fluid ounce (US)', symbol: 'fl oz', system: 'us', factor: 0.0000295735295625 },
      { id: 'cup_us', name: 'cup (US)', symbol: 'cup', system: 'us', factor: 0.0002365882365 },
      { id: 'pt_us', name: 'pint (US)', symbol: 'pt', system: 'us', factor: 0.000473176473 },
      { id: 'qt_us', name: 'quart (US)', symbol: 'qt', system: 'us', factor: 0.000946352946 },
      { id: 'gal_us', name: 'gallon (US)', symbol: 'gal', system: 'us', factor: 0.003785411784 },
      { id: 'floz_imp', name: 'fluid ounce (imp.)', symbol: 'fl oz', system: 'imperial', factor: 0.0000284130625 },
      { id: 'pt_imp', name: 'pint (imp.)', symbol: 'pt', system: 'imperial', factor: 0.00056826125 },
      { id: 'qt_imp', name: 'quart (imp.)', symbol: 'qt', system: 'imperial', factor: 0.0011365225 },
      { id: 'gal_imp', name: 'gallon (imp.)', symbol: 'gal', system: 'imperial', factor: 0.00454609 },
    ],
  },
  // ------------------------------------------------------------------ SPEED
  {
    id: 'speed', name: 'Speed / velocity', symbol: 'v', category: 'Speed & acceleration', baseSymbol: 'm/s',
    units: [
      { id: 'mps', name: 'metre per second', symbol: 'm/s', system: 'metric', factor: 1 },
      { id: 'kmh', name: 'kilometre per hour', symbol: 'km/h', system: 'metric', factor: 0.2777777777777778 },
      { id: 'mph', name: 'mile per hour', symbol: 'mph', system: 'imperial', factor: 0.44704 },
      { id: 'fps', name: 'foot per second', symbol: 'ft/s', system: 'imperial', factor: 0.3048 },
      { id: 'kn', name: 'knot', symbol: 'kn', system: 'other', factor: 0.5144444444444445 },
    ],
  },
  // ----------------------------------------------------------- ACCELERATION
  {
    id: 'acceleration', name: 'Acceleration', symbol: 'a', category: 'Speed & acceleration', baseSymbol: 'm/s²',
    units: [
      { id: 'mps2', name: 'metre per second squared', symbol: 'm/s²', system: 'si', factor: 1 },
      { id: 'fps2', name: 'foot per second squared', symbol: 'ft/s²', system: 'imperial', factor: 0.3048 },
      { id: 'gal_acc', name: 'gal (cm/s²)', symbol: 'Gal', system: 'other', factor: 0.01 },
      { id: 'g0', name: 'standard gravity', symbol: 'g', system: 'other', factor: 9.80665 },
    ],
  },
  // --------------------------------------------------------------- PRESSURE
  {
    id: 'pressure', name: 'Pressure', symbol: 'P', category: 'Pressure & stress', baseSymbol: 'Pa',
    units: [
      { id: 'pa', name: 'pascal', symbol: 'Pa', system: 'si', factor: 1 },
      { id: 'hpa', name: 'hectopascal', symbol: 'hPa', system: 'si', factor: 100 },
      { id: 'kpa', name: 'kilopascal', symbol: 'kPa', system: 'si', factor: 1000 },
      { id: 'mpa', name: 'megapascal', symbol: 'MPa', system: 'si', factor: 1e6 },
      { id: 'mbar', name: 'millibar', symbol: 'mbar', system: 'metric', factor: 100 },
      { id: 'bar', name: 'bar', symbol: 'bar', system: 'metric', factor: 1e5 },
      { id: 'atm', name: 'atmosphere', symbol: 'atm', system: 'other', factor: 101325 },
      { id: 'mmhg', name: 'millimetre of mercury', symbol: 'mmHg', system: 'other', factor: 133.322387415 },
      { id: 'psi', name: 'pound per square inch', symbol: 'psi', system: 'imperial', factor: 6894.757293168 },
      { id: 'psf', name: 'pound per square foot', symbol: 'psf', system: 'imperial', factor: 47.880259 },
    ],
  },
  // ----------------------------------------------------------------- ENERGY
  {
    id: 'energy', name: 'Energy / work', symbol: 'E', category: 'Energy, work & power', baseSymbol: 'J',
    units: [
      { id: 'j', name: 'joule', symbol: 'J', system: 'si', factor: 1 },
      { id: 'kj', name: 'kilojoule', symbol: 'kJ', system: 'si', factor: 1000 },
      { id: 'mj', name: 'megajoule', symbol: 'MJ', system: 'si', factor: 1e6 },
      { id: 'cal', name: 'calorie', symbol: 'cal', system: 'other', factor: 4.184 },
      { id: 'kcal', name: 'kilocalorie', symbol: 'kcal', system: 'other', factor: 4184 },
      { id: 'wh', name: 'watt-hour', symbol: 'Wh', system: 'other', factor: 3600 },
      { id: 'kwh', name: 'kilowatt-hour', symbol: 'kWh', system: 'other', factor: 3.6e6 },
      { id: 'ev', name: 'electronvolt', symbol: 'eV', system: 'other', factor: 1.602176634e-19 },
      { id: 'btu', name: 'British thermal unit', symbol: 'BTU', system: 'imperial', factor: 1055.05585262 },
      { id: 'ftlbf', name: 'foot-pound', symbol: 'ft·lbf', system: 'imperial', factor: 1.3558179483314 },
    ],
  },
  // ------------------------------------------------------------------ POWER
  {
    id: 'power', name: 'Power', symbol: 'P', category: 'Energy, work & power', baseSymbol: 'W',
    units: [
      { id: 'w', name: 'watt', symbol: 'W', system: 'si', factor: 1 },
      { id: 'kw', name: 'kilowatt', symbol: 'kW', system: 'si', factor: 1000 },
      { id: 'mw', name: 'megawatt', symbol: 'MW', system: 'si', factor: 1e6 },
      { id: 'hp', name: 'horsepower (mechanical)', symbol: 'hp', system: 'imperial', factor: 745.6998715823 },
      { id: 'ps', name: 'metric horsepower', symbol: 'PS', system: 'metric', factor: 735.49875 },
      { id: 'btuh', name: 'BTU per hour', symbol: 'BTU/h', system: 'imperial', factor: 0.2930710701722 },
    ],
  },
  // ------------------------------------------------------------ TEMPERATURE
  {
    id: 'temperature', name: 'Temperature', symbol: 'T', category: 'Temperature', baseSymbol: 'K',
    units: [
      { id: 'k', name: 'kelvin', symbol: 'K', system: 'si', factor: 1, offset: 0 },
      { id: 'c', name: 'degree Celsius', symbol: '°C', system: 'metric', factor: 1, offset: 273.15 },
      { id: 'f', name: 'degree Fahrenheit', symbol: '°F', system: 'imperial', factor: 0.5555555555555556, offset: 255.3722222222222 },
      { id: 'r', name: 'degree Rankine', symbol: '°R', system: 'other', factor: 0.5555555555555556, offset: 0 },
    ],
  },
  // ------------------------------------------------------------------- TIME
  {
    id: 'time', name: 'Time', symbol: 't', category: 'Time & frequency', baseSymbol: 's',
    units: [
      { id: 'ns', name: 'nanosecond', symbol: 'ns', system: 'si', factor: 1e-9 },
      { id: 'us', name: 'microsecond', symbol: 'µs', system: 'si', factor: 1e-6 },
      { id: 'ms', name: 'millisecond', symbol: 'ms', system: 'si', factor: 1e-3 },
      { id: 's', name: 'second', symbol: 's', system: 'si', factor: 1 },
      { id: 'min', name: 'minute', symbol: 'min', system: 'other', factor: 60 },
      { id: 'h', name: 'hour', symbol: 'h', system: 'other', factor: 3600 },
      { id: 'd', name: 'day', symbol: 'd', system: 'other', factor: 86400 },
      { id: 'wk', name: 'week', symbol: 'wk', system: 'other', factor: 604800 },
      { id: 'yr', name: 'year (Julian, 365.25 d)', symbol: 'yr', system: 'other', factor: 31557600 },
    ],
  },
  // -------------------------------------------------------------- FREQUENCY
  {
    id: 'frequency', name: 'Frequency', symbol: 'f', category: 'Time & frequency', baseSymbol: 'Hz',
    units: [
      { id: 'hz', name: 'hertz', symbol: 'Hz', system: 'si', factor: 1 },
      { id: 'khz', name: 'kilohertz', symbol: 'kHz', system: 'si', factor: 1e3 },
      { id: 'mhz', name: 'megahertz', symbol: 'MHz', system: 'si', factor: 1e6 },
      { id: 'ghz', name: 'gigahertz', symbol: 'GHz', system: 'si', factor: 1e9 },
      { id: 'rpm', name: 'revolution per minute', symbol: 'rpm', system: 'other', factor: 0.016666666666666666 },
    ],
  },
  // ------------------------------------------------------------------ ANGLE
  {
    id: 'angle', name: 'Plane angle', symbol: 'θ', category: 'Angle', baseSymbol: 'rad',
    units: [
      { id: 'rad', name: 'radian', symbol: 'rad', system: 'si', factor: 1 },
      { id: 'mrad', name: 'milliradian', symbol: 'mrad', system: 'si', factor: 1e-3 },
      { id: 'deg', name: 'degree', symbol: '°', system: 'other', factor: 0.017453292519943295 },
      { id: 'arcmin', name: 'arcminute', symbol: '′', system: 'other', factor: 0.0002908882086657216 },
      { id: 'arcsec', name: 'arcsecond', symbol: '″', system: 'other', factor: 0.00000484813681109536 },
      { id: 'grad', name: 'gradian', symbol: 'gon', system: 'other', factor: 0.015707963267948967 },
      { id: 'rev', name: 'revolution', symbol: 'rev', system: 'other', factor: 6.283185307179586 },
    ],
  },
  // ------------------------------------------------------------------- DATA
  {
    id: 'data', name: 'Data', symbol: '', category: 'Data & information', baseSymbol: 'B',
    units: [
      { id: 'bit', name: 'bit', symbol: 'b', system: 'other', factor: 0.125 },
      { id: 'byte', name: 'byte', symbol: 'B', system: 'other', factor: 1 },
      { id: 'kb', name: 'kilobyte (decimal)', symbol: 'kB', system: 'other', factor: 1e3 },
      { id: 'mb', name: 'megabyte (decimal)', symbol: 'MB', system: 'other', factor: 1e6 },
      { id: 'gb', name: 'gigabyte (decimal)', symbol: 'GB', system: 'other', factor: 1e9 },
      { id: 'tb', name: 'terabyte (decimal)', symbol: 'TB', system: 'other', factor: 1e12 },
      { id: 'pb', name: 'petabyte (decimal)', symbol: 'PB', system: 'other', factor: 1e15 },
      { id: 'kib', name: 'kibibyte (binary)', symbol: 'KiB', system: 'other', factor: 1024 },
      { id: 'mib', name: 'mebibyte (binary)', symbol: 'MiB', system: 'other', factor: 1048576 },
      { id: 'gib', name: 'gibibyte (binary)', symbol: 'GiB', system: 'other', factor: 1073741824 },
      { id: 'tib', name: 'tebibyte (binary)', symbol: 'TiB', system: 'other', factor: 1099511627776 },
    ],
  },
  // -------------------------------------------------------------- DATA RATE
  {
    id: 'datarate', name: 'Data rate', symbol: '', category: 'Data & information', baseSymbol: 'bit/s',
    units: [
      { id: 'bps', name: 'bit per second', symbol: 'bit/s', system: 'other', factor: 1 },
      { id: 'kbps', name: 'kilobit per second', symbol: 'kbit/s', system: 'other', factor: 1e3 },
      { id: 'mbps', name: 'megabit per second', symbol: 'Mbit/s', system: 'other', factor: 1e6 },
      { id: 'gbps', name: 'gigabit per second', symbol: 'Gbit/s', system: 'other', factor: 1e9 },
      { id: 'Bps', name: 'byte per second', symbol: 'B/s', system: 'other', factor: 8 },
      { id: 'kBps', name: 'kilobyte per second', symbol: 'kB/s', system: 'other', factor: 8e3 },
      { id: 'mBps', name: 'megabyte per second', symbol: 'MB/s', system: 'other', factor: 8e6 },
    ],
  },
  // ---------------------------------------------------------------- DENSITY
  {
    id: 'density', name: 'Density', symbol: 'ρ', category: 'Density & concentration', baseSymbol: 'kg/m³',
    units: [
      { id: 'kgm3', name: 'kilogram per cubic metre', symbol: 'kg/m³', system: 'si', factor: 1 },
      { id: 'gcm3', name: 'gram per cubic centimetre', symbol: 'g/cm³', system: 'metric', factor: 1000 },
      { id: 'gml', name: 'gram per millilitre', symbol: 'g/mL', system: 'metric', factor: 1000 },
      { id: 'lbft3', name: 'pound per cubic foot', symbol: 'lb/ft³', system: 'imperial', factor: 16.018463373960138 },
      { id: 'lbin3', name: 'pound per cubic inch', symbol: 'lb/in³', system: 'imperial', factor: 27679.904710203125 },
    ],
  },
  // -------------------------------------------------------- ELECTRIC CURRENT
  {
    id: 'current', name: 'Electric current', symbol: 'I', category: 'Electricity & magnetism', baseSymbol: 'A',
    units: [
      { id: 'ua', name: 'microampere', symbol: 'µA', system: 'si', factor: 1e-6 },
      { id: 'ma', name: 'milliampere', symbol: 'mA', system: 'si', factor: 1e-3 },
      { id: 'a', name: 'ampere', symbol: 'A', system: 'si', factor: 1 },
      { id: 'ka', name: 'kiloampere', symbol: 'kA', system: 'si', factor: 1e3 },
    ],
  },
  // ---------------------------------------------------------------- VOLTAGE
  {
    id: 'voltage', name: 'Voltage', symbol: 'V', category: 'Electricity & magnetism', baseSymbol: 'V',
    units: [
      { id: 'uv', name: 'microvolt', symbol: 'µV', system: 'si', factor: 1e-6 },
      { id: 'mv', name: 'millivolt', symbol: 'mV', system: 'si', factor: 1e-3 },
      { id: 'v', name: 'volt', symbol: 'V', system: 'si', factor: 1 },
      { id: 'kv', name: 'kilovolt', symbol: 'kV', system: 'si', factor: 1e3 },
      { id: 'megv', name: 'megavolt', symbol: 'MV', system: 'si', factor: 1e6 },
    ],
  },
  // ------------------------------------------------------------- RESISTANCE
  {
    id: 'resistance', name: 'Resistance', symbol: 'R', category: 'Electricity & magnetism', baseSymbol: 'Ω',
    units: [
      { id: 'mohm', name: 'milliohm', symbol: 'mΩ', system: 'si', factor: 1e-3 },
      { id: 'ohm', name: 'ohm', symbol: 'Ω', system: 'si', factor: 1 },
      { id: 'kohm', name: 'kilohm', symbol: 'kΩ', system: 'si', factor: 1e3 },
      { id: 'megohm', name: 'megohm', symbol: 'MΩ', system: 'si', factor: 1e6 },
    ],
  },
  // ------------------------------------------------------------ CAPACITANCE
  {
    id: 'capacitance', name: 'Capacitance', symbol: 'C', category: 'Electricity & magnetism', baseSymbol: 'F',
    units: [
      { id: 'pf', name: 'picofarad', symbol: 'pF', system: 'si', factor: 1e-12 },
      { id: 'nf', name: 'nanofarad', symbol: 'nF', system: 'si', factor: 1e-9 },
      { id: 'uf', name: 'microfarad', symbol: 'µF', system: 'si', factor: 1e-6 },
      { id: 'mf', name: 'millifarad', symbol: 'mF', system: 'si', factor: 1e-3 },
      { id: 'f_cap', name: 'farad', symbol: 'F', system: 'si', factor: 1 },
    ],
  },
  // --------------------------------------------------------- AMOUNT OF SUBST.
  {
    id: 'amount', name: 'Amount of substance', symbol: 'n', category: 'Density & concentration', baseSymbol: 'mol',
    units: [
      { id: 'umol', name: 'micromole', symbol: 'µmol', system: 'si', factor: 1e-6 },
      { id: 'mmol', name: 'millimole', symbol: 'mmol', system: 'si', factor: 1e-3 },
      { id: 'mol', name: 'mole', symbol: 'mol', system: 'si', factor: 1 },
      { id: 'kmol', name: 'kilomole', symbol: 'kmol', system: 'si', factor: 1e3 },
    ],
  },
];

export const SI_PREFIXES: SiPrefix[] = [
  { name: 'yotta', symbol: 'Y', exponent: 24 },
  { name: 'zetta', symbol: 'Z', exponent: 21 },
  { name: 'exa', symbol: 'E', exponent: 18 },
  { name: 'peta', symbol: 'P', exponent: 15 },
  { name: 'tera', symbol: 'T', exponent: 12 },
  { name: 'giga', symbol: 'G', exponent: 9 },
  { name: 'mega', symbol: 'M', exponent: 6 },
  { name: 'kilo', symbol: 'k', exponent: 3 },
  { name: 'hecto', symbol: 'h', exponent: 2 },
  { name: 'deca', symbol: 'da', exponent: 1 },
  { name: '(base)', symbol: '', exponent: 0 },
  { name: 'deci', symbol: 'd', exponent: -1 },
  { name: 'centi', symbol: 'c', exponent: -2 },
  { name: 'milli', symbol: 'm', exponent: -3 },
  { name: 'micro', symbol: 'µ', exponent: -6 },
  { name: 'nano', symbol: 'n', exponent: -9 },
  { name: 'pico', symbol: 'p', exponent: -12 },
  { name: 'femto', symbol: 'f', exponent: -15 },
  { name: 'atto', symbol: 'a', exponent: -18 },
  { name: 'zepto', symbol: 'z', exponent: -21 },
  { name: 'yocto', symbol: 'y', exponent: -24 },
];

export const FORMULAS: Formula[] = [
  {
    name: 'Newton\u2019s second law', expression: 'F = m · a', area: 'Mechanics',
    description: 'The net force on a body equals its mass times its acceleration.',
    variables: [
      { sym: 'F', meaning: 'force', unit: 'N' },
      { sym: 'm', meaning: 'mass', unit: 'kg' },
      { sym: 'a', meaning: 'acceleration', unit: 'm/s²' },
    ],
  },
  {
    name: 'Weight', expression: 'W = m · g', area: 'Mechanics',
    description: 'Weight is the gravitational force on a mass (g ≈ 9.81 m/s²).',
    variables: [
      { sym: 'W', meaning: 'weight (force)', unit: 'N' },
      { sym: 'm', meaning: 'mass', unit: 'kg' },
      { sym: 'g', meaning: 'gravitational acceleration', unit: 'm/s²' },
    ],
  },
  {
    name: 'Pressure', expression: 'P = F / A', area: 'Mechanics',
    description: 'Pressure is force distributed over an area.',
    variables: [
      { sym: 'P', meaning: 'pressure', unit: 'Pa' },
      { sym: 'F', meaning: 'force', unit: 'N' },
      { sym: 'A', meaning: 'area', unit: 'm²' },
    ],
  },
  {
    name: 'Work', expression: 'W = F · d', area: 'Mechanics',
    description: 'Work done by a constant force over a displacement.',
    variables: [
      { sym: 'W', meaning: 'work', unit: 'J' },
      { sym: 'F', meaning: 'force', unit: 'N' },
      { sym: 'd', meaning: 'displacement', unit: 'm' },
    ],
  },
  {
    name: 'Power', expression: 'P = W / t', area: 'Mechanics',
    description: 'Power is the rate of doing work or transferring energy.',
    variables: [
      { sym: 'P', meaning: 'power', unit: 'W' },
      { sym: 'W', meaning: 'work / energy', unit: 'J' },
      { sym: 't', meaning: 'time', unit: 's' },
    ],
  },
  {
    name: 'Kinetic energy', expression: 'Eₖ = ½ · m · v²', area: 'Mechanics',
    description: 'Energy a body possesses due to its motion.',
    variables: [
      { sym: 'Eₖ', meaning: 'kinetic energy', unit: 'J' },
      { sym: 'm', meaning: 'mass', unit: 'kg' },
      { sym: 'v', meaning: 'speed', unit: 'm/s' },
    ],
  },
  {
    name: 'Gravitational potential energy', expression: 'Eₚ = m · g · h', area: 'Mechanics',
    description: 'Energy stored due to height in a gravitational field.',
    variables: [
      { sym: 'Eₚ', meaning: 'potential energy', unit: 'J' },
      { sym: 'm', meaning: 'mass', unit: 'kg' },
      { sym: 'g', meaning: 'gravitational acceleration', unit: 'm/s²' },
      { sym: 'h', meaning: 'height', unit: 'm' },
    ],
  },
  {
    name: 'Momentum', expression: 'p = m · v', area: 'Mechanics',
    description: 'Linear momentum of a moving body.',
    variables: [
      { sym: 'p', meaning: 'momentum', unit: 'kg·m/s' },
      { sym: 'm', meaning: 'mass', unit: 'kg' },
      { sym: 'v', meaning: 'velocity', unit: 'm/s' },
    ],
  },
  {
    name: 'Density', expression: 'ρ = m / V', area: 'Materials',
    description: 'Mass contained per unit of volume.',
    variables: [
      { sym: 'ρ', meaning: 'density', unit: 'kg/m³' },
      { sym: 'm', meaning: 'mass', unit: 'kg' },
      { sym: 'V', meaning: 'volume', unit: 'm³' },
    ],
  },
  {
    name: 'Average speed', expression: 'v = d / t', area: 'Kinematics',
    description: 'Distance travelled per unit time.',
    variables: [
      { sym: 'v', meaning: 'speed', unit: 'm/s' },
      { sym: 'd', meaning: 'distance', unit: 'm' },
      { sym: 't', meaning: 'time', unit: 's' },
    ],
  },
  {
    name: 'Acceleration', expression: 'a = Δv / Δt', area: 'Kinematics',
    description: 'Rate of change of velocity over time.',
    variables: [
      { sym: 'a', meaning: 'acceleration', unit: 'm/s²' },
      { sym: 'Δv', meaning: 'change in velocity', unit: 'm/s' },
      { sym: 'Δt', meaning: 'change in time', unit: 's' },
    ],
  },
  {
    name: 'Ohm\u2019s law', expression: 'V = I · R', area: 'Electricity',
    description: 'Voltage across a resistor equals current times resistance.',
    variables: [
      { sym: 'V', meaning: 'voltage', unit: 'V' },
      { sym: 'I', meaning: 'current', unit: 'A' },
      { sym: 'R', meaning: 'resistance', unit: 'Ω' },
    ],
  },
  {
    name: 'Electrical power', expression: 'P = V · I', area: 'Electricity',
    description: 'Power dissipated by an electrical component.',
    variables: [
      { sym: 'P', meaning: 'power', unit: 'W' },
      { sym: 'V', meaning: 'voltage', unit: 'V' },
      { sym: 'I', meaning: 'current', unit: 'A' },
    ],
  },
  {
    name: 'Electric charge', expression: 'Q = I · t', area: 'Electricity',
    description: 'Charge transferred by a steady current over time.',
    variables: [
      { sym: 'Q', meaning: 'charge', unit: 'C' },
      { sym: 'I', meaning: 'current', unit: 'A' },
      { sym: 't', meaning: 'time', unit: 's' },
    ],
  },
  {
    name: 'Wave speed', expression: 'v = f · λ', area: 'Waves',
    description: 'A wave\u2019s speed equals its frequency times its wavelength.',
    variables: [
      { sym: 'v', meaning: 'wave speed', unit: 'm/s' },
      { sym: 'f', meaning: 'frequency', unit: 'Hz' },
      { sym: 'λ', meaning: 'wavelength', unit: 'm' },
    ],
  },
  {
    name: 'Frequency & period', expression: 'f = 1 / T', area: 'Waves',
    description: 'Frequency is the reciprocal of the period.',
    variables: [
      { sym: 'f', meaning: 'frequency', unit: 'Hz' },
      { sym: 'T', meaning: 'period', unit: 's' },
    ],
  },
  {
    name: 'Heat energy', expression: 'Q = m · c · ΔT', area: 'Thermodynamics',
    description: 'Heat to change a mass\u2019s temperature by ΔT (c = specific heat).',
    variables: [
      { sym: 'Q', meaning: 'heat energy', unit: 'J' },
      { sym: 'm', meaning: 'mass', unit: 'kg' },
      { sym: 'c', meaning: 'specific heat capacity', unit: 'J/(kg·K)' },
      { sym: 'ΔT', meaning: 'temperature change', unit: 'K' },
    ],
  },
  {
    name: 'Ideal gas law', expression: 'P · V = n · R · T', area: 'Thermodynamics',
    description: 'Relates pressure, volume, amount and temperature of an ideal gas.',
    variables: [
      { sym: 'P', meaning: 'pressure', unit: 'Pa' },
      { sym: 'V', meaning: 'volume', unit: 'm³' },
      { sym: 'n', meaning: 'amount of substance', unit: 'mol' },
      { sym: 'R', meaning: 'gas constant', unit: 'J/(mol·K)' },
      { sym: 'T', meaning: 'temperature', unit: 'K' },
    ],
  },
];
