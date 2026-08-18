import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { GoogleMapComponent } from '../../components/GoogleMapComponent';
import { RazorpaySim } from '../../components/RazorpaySim';
import { Search, MapPin, Clock, Calendar, ShieldCheck, HelpCircle, Star, Compass, AlertTriangle, Sparkles, Navigation, Info, LocateFixed, Ruler, List, Map } from 'lucide-react';
import confetti from 'canvas-confetti';

interface ParkingResult {
  id: string;
  name: string;
  description: string;
  address: string;
  latitude: number;
  longitude: number;
  pricePerHour: number;
  capacity: number;
  vehicleType: string;
  status: string;
  verificationScore: number;
  availabilityStatus: string;
  distance: number;
  walkingTime: number;
  drivingTime: number;
  trafficLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'VERY_HIGH';
  availabilityProbability: number;
  availabilityExplanation: string[];
  rating: number;
  reviewCount: number;
  aiScore: number;
  recommendationNotes: string[];
  estimatedTotal: number;
  recommendedPrice: number;
  recommendedPriceExplanation: string[];
  dimensions?: string;
  parkingType?: string;
  operatingHours?: string;
  features?: string;
  reviews?: Array<{
    id: string;
    rating: number;
    comment: string;
    createdAt: string;
    driver?: { name: string };
  }>;
}

export const DriverDashboard: React.FC = () => {
  const { apiFetch } = useAuth();

  // Search States
  const [destination, setDestination] = useState('ABES Engineering College');
  const [searchLat, setSearchLat] = useState(28.6360);
  const [searchLng, setSearchLng] = useState(77.4475);
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [startTime, setStartTime] = useState('19:00');
  const [duration, setDuration] = useState('3');
  const [vehicleType, setVehicleType] = useState('BOTH');
  const [mobileTab, setMobileTab] = useState<'map' | 'list'>('map');

  // API States
  const [results, setResults] = useState<ParkingResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedSpaceId, setSelectedSpaceId] = useState<string | null>(null);
  const [locatingUser, setLocatingUser] = useState(false);

  const handleUseCurrentLocation = () => {
    if (!navigator.geolocation) {
      setError('Geolocation is not supported by your browser.');
      return;
    }

    setLocatingUser(true);
    setError(null);

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const lat = position.coords.latitude;
        const lng = position.coords.longitude;

        setSearchLat(lat);
        setSearchLng(lng);

        try {
          const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=16`);
          const data = await res.json();
          if (data && data.display_name) {
            const parts = data.display_name.split(',');
            const shortAddress = parts.slice(0, 3).join(', ');
            setDestination(shortAddress);
          } else {
            setDestination(`Current Location (${lat.toFixed(4)}, ${lng.toFixed(4)})`);
          }
        } catch {
          setDestination(`Current Location (${lat.toFixed(4)}, ${lng.toFixed(4)})`);
        }

        try {
          const data = await apiFetch(
            `/api/parking/search?lat=${lat}&lng=${lng}&date=${date}&startTime=${startTime}&duration=${duration}&vehicleType=${vehicleType}`
          );
          setResults(data);
          if (data.length > 0) {
            setSelectedSpaceId(data[0].id);
          } else {
            setSelectedSpaceId(null);
          }
        } catch (err: any) {
          setError(err.message || 'Failed to search nearby spaces.');
        } finally {
          setLocatingUser(false);
        }
      },
      (err) => {
        setLocatingUser(false);
        setError(`Location access denied or unavailable: ${err.message}`);
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  // Checkout and Payment States
  const [checkoutSpace, setCheckoutSpace] = useState<ParkingResult | null>(null);
  const [creatingBooking, setCreatingBooking] = useState(false);
  const [bookingResponse, setBookingResponse] = useState<any>(null);
  const [showPayment, setShowPayment] = useState(false);
  const [paymentOrder, setPaymentOrder] = useState<any>(null);
  const [bookingConfirmed, setBookingConfirmed] = useState(false);

  // Trigger search on mount
  useEffect(() => {
    handleSearch();
  }, []);

  const handleSearch = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setLoading(true);
    setError(null);
    setSelectedSpaceId(null);

    // Geolocations matching all Delhi NCR hubs (Delhi, Noida, Greater Noida, Gurgaon, Ghaziabad)
    let lat = searchLat || 28.6360;
    let lng = searchLng || 77.4475;
    
    const lowerDest = destination.toLowerCase();
    if (lowerDest.includes('connaught') || lowerDest.includes('cp') || lowerDest.includes('central delhi')) {
      lat = 28.6315;
      lng = 77.2167;
    } else if (lowerDest.includes('south ext') || lowerDest.includes('lajpat') || lowerDest.includes('south delhi')) {
      lat = 28.5700;
      lng = 77.2200;
    } else if (lowerDest.includes('airport') || lowerDest.includes('t3') || lowerDest.includes('igi')) {
      lat = 28.5562;
      lng = 77.0999;
    } else if (lowerDest.includes('delhi') && !lowerDest.includes('noida') && !lowerDest.includes('ghaziabad')) {
      lat = 28.6315;
      lng = 77.2167;
    } else if (lowerDest.includes('noida sector 18') || lowerDest.includes('atta') || lowerDest.includes('dlf mall')) {
      lat = 28.5708;
      lng = 77.3260;
    } else if (lowerDest.includes('noida sector 62') || lowerDest.includes('stellar')) {
      lat = 28.6280;
      lng = 77.3680;
    } else if (lowerDest.includes('noida') && !lowerDest.includes('greater')) {
      lat = 28.5708;
      lng = 77.3260;
    } else if (lowerDest.includes('gaur city') || lowerDest.includes('noida extension') || lowerDest.includes('greater noida west')) {
      lat = 28.6100;
      lng = 77.4400;
    } else if (lowerDest.includes('pari chowk') || lowerDest.includes('knowledge park') || lowerDest.includes('greater noida')) {
      lat = 28.4670;
      lng = 77.5140;
    } else if (lowerDest.includes('cyber city') || lowerDest.includes('cyber hub') || lowerDest.includes('gurgaon') || lowerDest.includes('gurugram')) {
      lat = 28.4950;
      lng = 77.0890;
    } else if (lowerDest.includes('golf course') || lowerDest.includes('horizon')) {
      lat = 28.4590;
      lng = 77.0980;
    } else if (lowerDest.includes('mg road')) {
      lat = 28.4800;
      lng = 77.0800;
    } else if (lowerDest.includes('indirapuram') || lowerDest.includes('shipra') || lowerDest.includes('habitat')) {
      lat = 28.6360;
      lng = 77.3710;
    } else if (lowerDest.includes('vaishali')) {
      lat = 28.6490;
      lng = 77.3400;
    } else if (lowerDest.includes('vasundhara')) {
      lat = 28.6600;
      lng = 77.3750;
    } else if (lowerDest.includes('raj nagar')) {
      lat = 28.6920;
      lng = 77.4420;
    } else if (lowerDest.includes('kavi nagar')) {
      lat = 28.6700;
      lng = 77.4500;
    } else if (lowerDest.includes('railway') || lowerDest.includes('junction') || lowerDest.includes('station')) {
      lat = 28.6650;
      lng = 77.4320;
    } else if (lowerDest.includes('sahibabad')) {
      lat = 28.6720;
      lng = 77.3820;
    } else if (lowerDest.includes('govindpuram')) {
      lat = 28.6850;
      lng = 77.4780;
    } else if (lowerDest.includes('mohan nagar')) {
      lat = 28.6770;
      lng = 77.3970;
    } else if (lowerDest.includes('vijay')) {
      lat = 28.6410;
      lng = 77.4390;
    } else if (lowerDest.includes('crossing') || lowerDest.includes('republik')) {
      lat = 28.6290;
      lng = 77.4520;
    } else if (lowerDest.includes('lal kuan')) {
      lat = 28.6380;
      lng = 77.4560;
    }

    setSearchLat(lat);
    setSearchLng(lng);

    try {
      const data = await apiFetch(
        `/api/parking/search?lat=${lat}&lng=${lng}&date=${date}&startTime=${startTime}&duration=${duration}&vehicleType=${vehicleType}`
      );
      setResults(data);
      if (data.length > 0) {
        setSelectedSpaceId(data[0].id); // Auto-select top rated AI recommendation
      }
    } catch (err: any) {
      setError(err.message || 'Failed to search for parking spots.');
    } finally {
      setLoading(false);
    }
  };

  const handleSelectSpace = (spaceId: string) => {
    setSelectedSpaceId(spaceId);
    // Smooth scroll into view for desktop layout
    const cardElement = document.getElementById(`space-card-${spaceId}`);
    if (cardElement) {
      cardElement.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
  };

  const handleMapClick = async (lat: number, lng: number) => {
    setSearchLat(lat);
    setSearchLng(lng);
    setLoading(true);
    setError(null);

    // Fetch reverse geocode address using free Nominatim API
    try {
      const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=16`);
      const data = await res.json();
      if (data && data.display_name) {
        const parts = data.display_name.split(',');
        const shortAddress = parts.slice(0, 3).join(', ');
        setDestination(shortAddress);
      } else {
        setDestination(`Spot @ ${lat.toFixed(4)}, ${lng.toFixed(4)}`);
      }
    } catch {
      setDestination(`Spot @ ${lat.toFixed(4)}, ${lng.toFixed(4)}`);
    }

    try {
      const data = await apiFetch(
        `/api/parking/search?lat=${lat}&lng=${lng}&date=${date}&startTime=${startTime}&duration=${duration}&vehicleType=${vehicleType}`
      );
      setResults(data);
      if (data.length > 0) {
        setSelectedSpaceId(data[0].id);
      } else {
        setSelectedSpaceId(null);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to search at selected map point.');
    } finally {
      setLoading(false);
    }
  };

  const handleAutocompleteSelect = async (lat: number, lng: number, address: string) => {
    setSearchLat(lat);
    setSearchLng(lng);
    setDestination(address);
    setLoading(true);
    setError(null);

    try {
      const data = await apiFetch(
        `/api/parking/search?lat=${lat}&lng=${lng}&date=${date}&startTime=${startTime}&duration=${duration}&vehicleType=${vehicleType}`
      );
      setResults(data);
      if (data.length > 0) {
        setSelectedSpaceId(data[0].id);
      } else {
        setSelectedSpaceId(null);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to search at autocomplete selection.');
    } finally {
      setLoading(false);
    }
  };

  // 1. Initialise Reservation
  const handleOpenCheckout = (space: ParkingResult) => {
    setCheckoutSpace(space);
    setBookingConfirmed(false);
    setBookingResponse(null);
  };

  const handleConfirmReservation = async () => {
    if (!checkoutSpace) return;
    setCreatingBooking(true);
    setError(null);

    try {
      // Calculate times
      const startDateTime = new Date(`${date}T${startTime}`);
      const endDateTime = new Date(startDateTime.getTime() + parseFloat(duration) * 3600000);

      // Create booking intent in DB
      const resData = await apiFetch('/api/bookings', {
        method: 'POST',
        body: JSON.stringify({
          parkingSpaceId: checkoutSpace.id,
          startTime: startDateTime.toISOString(),
          endTime: endDateTime.toISOString(),
        }),
      });

      setBookingResponse(resData.booking);

      // Create Payment Order Intent
      const payOrder = await apiFetch('/api/payments/create', {
        method: 'POST',
        body: JSON.stringify({ bookingId: resData.booking.id }),
      });

      setPaymentOrder(payOrder.order);
      setShowPayment(true);
    } catch (err: any) {
      setError(err.message || 'Failed to create reservation.');
    } finally {
      setCreatingBooking(false);
    }
  };

  // 2. Complete Payment and Verify
  const handlePaymentSuccess = async (paymentId: string) => {
    if (!bookingResponse || !paymentOrder) return;
    setShowPayment(false);
    setLoading(true);

    try {
      // Send verification payload to backend
      const verifyResult = await apiFetch('/api/payments/verify', {
        method: 'POST',
        body: JSON.stringify({
          bookingId: bookingResponse.id,
          orderId: paymentOrder.orderId,
          paymentId: paymentId,
        }),
      });

      setBookingConfirmed(true);
      
      // Trigger canvas-confetti success burst!
      confetti({
        particleCount: 150,
        spread: 80,
        origin: { y: 0.6 },
      });

    } catch (err: any) {
      setError(err.message || 'Payment verification failed.');
    } finally {
      setLoading(false);
    }
  };

  const selectedSpaceDetail = results.find((r) => r.id === selectedSpaceId);

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-gray-50 flex flex-col">
      
      {/* Search Header Panel */}
      <section className="bg-white border-b border-gray-100 shadow-sm p-4 sm:p-6 sticky top-16 z-30">
        <form onSubmit={handleSearch} className="max-w-7xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-3 items-end">
          
          <div className="flex flex-col gap-1 lg:col-span-2">
            <div className="flex justify-between items-center">
              <label className="text-[10px] uppercase font-black text-gray-400">Destination</label>
              <button
                type="button"
                onClick={handleUseCurrentLocation}
                disabled={locatingUser}
                className="text-[10px] font-bold text-indigo-600 hover:text-indigo-800 flex items-center gap-1 transition-colors disabled:opacity-50"
                title="Use device GPS location"
              >
                <LocateFixed className={`w-3 h-3 ${locatingUser ? 'animate-spin' : ''}`} />
                <span>{locatingUser ? 'Locating...' : 'Use My Location'}</span>
              </button>
            </div>
            <div className="relative">
              <MapPin className="absolute left-3 top-3 w-4 h-4 text-indigo-500" />
              <input
                id="search-destination-input"
                type="text"
                value={destination}
                onChange={(e) => setDestination(e.target.value)}
                className="w-full pl-9 pr-3 py-2 border border-gray-200 rounded-xl text-xs font-semibold focus:outline-none focus:border-indigo-600 transition-colors"
                placeholder="Where to?"
              />
            </div>
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-[10px] uppercase font-black text-gray-400">Date</label>
            <div className="relative">
              <Calendar className="absolute left-3 top-3 w-4 h-4 text-indigo-500" />
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full pl-9 pr-3 py-2 border border-gray-200 rounded-xl text-xs font-semibold focus:outline-none focus:border-indigo-600"
              />
            </div>
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-[10px] uppercase font-black text-gray-400">Arrival Time</label>
            <div className="relative">
              <Clock className="absolute left-3 top-3 w-4 h-4 text-indigo-500" />
              <input
                type="time"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                className="w-full pl-9 pr-3 py-2 border border-gray-200 rounded-xl text-xs font-semibold focus:outline-none focus:border-indigo-600"
              />
            </div>
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-[10px] uppercase font-black text-gray-400">Duration (Hours)</label>
            <select
              value={duration}
              onChange={(e) => setDuration(e.target.value)}
              className="w-full px-3 py-2 border border-gray-200 rounded-xl text-xs font-semibold focus:outline-none focus:border-indigo-600 appearance-none bg-no-repeat bg-[right_12px_center] bg-[url('data:image/svg+xml;charset=utf-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20viewBox%3D%220%200%2020%2020%22%20fill%3D%22none%22%3E%3Cpath%20d%3D%22M7%209l3%203%203-3%22%20stroke%3D%22%236b7280%22%20stroke-width%3D%221.5%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%2F%3E%3C%2Fsvg%3E')]"
            >
              <option value="1">1 hour</option>
              <option value="2">2 hours</option>
              <option value="3">3 hours</option>
              <option value="5">5 hours</option>
              <option value="8">8 hours</option>
            </select>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="bg-indigo-600 hover:bg-indigo-700 text-white py-2 px-4 rounded-xl font-bold text-xs shadow-md shadow-indigo-100 flex items-center justify-center gap-1.5 h-[38px] transition-colors"
          >
            <Search className="w-4 h-4" />
            <span>Search Parking</span>
          </button>
        </form>
      </section>

      {/* Mobile Map / List View Switcher */}
      <div className="lg:hidden flex p-1 bg-gray-200/60 dark:bg-slate-800/80 rounded-xl max-w-xs mx-auto mt-4 border border-gray-200 dark:border-slate-700">
        <button
          type="button"
          onClick={() => setMobileTab('map')}
          className={`flex-1 py-2 text-xs font-bold rounded-lg flex items-center justify-center gap-1.5 transition-all ${
            mobileTab === 'map' ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-xs' : 'text-gray-600 dark:text-gray-400'
          }`}
        >
          <Map className="w-4 h-4" />
          <span>Map View</span>
        </button>
        <button
          type="button"
          onClick={() => setMobileTab('list')}
          className={`flex-1 py-2 text-xs font-bold rounded-lg flex items-center justify-center gap-1.5 transition-all ${
            mobileTab === 'list' ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-xs' : 'text-gray-600 dark:text-gray-400'
          }`}
        >
          <List className="w-4 h-4" />
          <span>List ({results.length})</span>
        </button>
      </div>

      {/* Main Split Interface */}
      <div className="flex-1 max-w-7xl mx-auto w-full p-4 sm:p-6 flex flex-col lg:flex-row gap-6">
        
        {/* Left Side: Search Results */}
        <div className={`w-full lg:w-3/5 flex flex-col gap-4 ${mobileTab === 'map' ? 'hidden lg:flex' : 'flex'}`}>
          <div className="flex items-center justify-between">
            <h2 className="font-extrabold text-lg text-gray-900 flex items-center gap-2">
              <Compass className="w-5 h-5 text-indigo-600" />
              <span>Available Parking ({results.length})</span>
            </h2>
            <div className="flex gap-2">
              <button
                onClick={() => { setVehicleType('BOTH'); handleSearch(); }}
                className={`px-3 py-1 rounded-full text-[10px] font-bold border transition-all ${
                  vehicleType === 'BOTH' ? 'bg-indigo-50 border-indigo-200 text-indigo-600' : 'bg-white border-gray-200 text-gray-500'
                }`}
              >
                All Vehicles
              </button>
              <button
                onClick={() => { setVehicleType('FOUR_WHEELER'); handleSearch(); }}
                className={`px-3 py-1 rounded-full text-[10px] font-bold border transition-all ${
                  vehicleType === 'FOUR_WHEELER' ? 'bg-indigo-50 border-indigo-200 text-indigo-600' : 'bg-white border-gray-200 text-gray-500'
                }`}
              >
                Cars
              </button>
              <button
                onClick={() => { setVehicleType('TWO_WHEELER'); handleSearch(); }}
                className={`px-3 py-1 rounded-full text-[10px] font-bold border transition-all ${
                  vehicleType === 'TWO_WHEELER' ? 'bg-indigo-50 border-indigo-200 text-indigo-600' : 'bg-white border-gray-200 text-gray-500'
                }`}
              >
                Bikes
              </button>
            </div>
          </div>

          {error && <div className="p-4 bg-rose-50 border border-rose-100 rounded-xl text-rose-600 text-xs">{error}</div>}

          {loading ? (
            <div className="flex-1 flex flex-col items-center justify-center py-20 bg-white rounded-2xl border border-gray-100 shadow-sm gap-3">
              <div className="w-8 h-8 rounded-full border-4 border-indigo-100 border-t-indigo-600 animate-spin"></div>
              <p className="text-xs text-gray-500 font-medium">AI routing & predicting space availability...</p>
            </div>
          ) : results.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center py-20 bg-white rounded-2xl border border-gray-100 shadow-sm text-center p-6">
              <Navigation className="w-12 h-12 text-gray-300 rotate-45 mb-4" />
              <h3 className="font-bold text-gray-800 text-sm">No Parking Spaces Found</h3>
              <p className="text-xs text-gray-400 mt-1 max-w-xs">No spots matches your filters. Try selecting another vehicle category or searching for "ABES Engineering College".</p>
            </div>
          ) : (
            <div className="space-y-3 max-h-[600px] overflow-y-auto pr-1">
              {results.map((space, index) => {
                const isSelected = space.id === selectedSpaceId;
                const isTopMatch = index === 0; // Ranked first by AI Score

                return (
                  <div
                    key={space.id}
                    id={`space-card-${space.id}`}
                    onClick={() => handleSelectSpace(space.id)}
                    className={`bg-white rounded-2xl border p-4 cursor-pointer transition-all relative ${
                      isSelected
                        ? 'border-indigo-600 shadow-md ring-1 ring-indigo-600/20'
                        : 'border-gray-100 hover:border-gray-300 shadow-sm'
                    }`}
                  >
                    <div className="flex gap-4">
                      {/* Photo Thumbnail */}
                      <div className="w-20 h-20 rounded-xl overflow-hidden shrink-0 border border-gray-100 bg-gray-50">
                        <img
                          src={space.images?.[0]?.url || 'https://images.unsplash.com/photo-1506521788723-85811181d4db'}
                          alt={space.name}
                          className="w-full h-full object-cover"
                        />
                      </div>

                      {/* Summary */}
                      <div className="flex-1 flex flex-col justify-between">
                        <div>
                          <div className="flex justify-between items-start gap-2">
                            <div className="flex items-center gap-2 flex-wrap">
                              <h3 className="font-extrabold text-sm text-gray-900 leading-snug">{space.name}</h3>
                              {isTopMatch && (
                                <span className="bg-emerald-600 text-white px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider flex items-center gap-1 shadow-xs">
                                  <Sparkles className="w-3 h-3" />
                                  <span>Best Match</span>
                                </span>
                              )}
                            </div>
                            <div className="flex items-center gap-1 shrink-0">
                              <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                              <span className="text-xs font-bold text-gray-700">
                                {space.reviews && space.reviews.length > 0 ? space.rating.toFixed(1) : 'New'}
                              </span>
                            </div>
                          </div>

                          <p className="text-[10px] text-gray-500 mt-0.5 line-clamp-1">{space.address}</p>

                          <div className="flex flex-wrap items-center gap-2 mt-2">
                            <span className="text-[10px] font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-full">
                              {space.distance < 1 ? `${(space.distance * 1000).toFixed(0)} m away` : `${space.distance.toFixed(1)} km away`}
                            </span>
                            <span className="text-[10px] font-bold text-gray-500 bg-gray-50 px-2 py-0.5 rounded-full flex items-center gap-1">
                              <Clock className="w-3 h-3 text-gray-400" />
                              {space.walkingTime} min walk
                            </span>
                            {space.status === 'VERIFIED' && (
                              <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full flex items-center gap-0.5">
                                <ShieldCheck className="w-3.5 h-3.5" />
                                Verified
                              </span>
                            )}
                            {space.dimensions && (
                              <span className="text-[10px] font-bold text-violet-600 bg-violet-50 px-2 py-0.5 rounded-full flex items-center gap-1">
                                <Ruler className="w-3 h-3 text-violet-500" />
                                {space.dimensions}
                              </span>
                            )}
                            <span className="text-[10px] font-bold text-sky-700 bg-sky-50 px-2 py-0.5 rounded-full flex items-center gap-1">
                              {space.parkingType === 'INDOOR' ? '🏢 Indoor Basement' : '☀️ Outdoor Open-Air'}
                            </span>
                            {space.operatingHours && (
                              <span className="text-[10px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full flex items-center gap-1">
                                <Clock className="w-3 h-3 text-amber-500" />
                                {space.operatingHours}
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Cost & AI Badge */}
                        <div className="flex justify-between items-center mt-3 pt-3 border-t border-gray-50">
                          <div>
                            <div className="flex items-center gap-1.5 flex-wrap">
                              <span className="text-xs text-gray-500 font-bold uppercase">Total Est.</span>
                              <span className="text-base font-black text-gray-900">₹{space.pricePerHour * parseFloat(duration)}</span>
                              <span className="text-xs text-gray-600 font-semibold">for {duration} hrs</span>
                            </div>
                            <div className="text-[11px] text-indigo-600 font-semibold mt-0.5">
                              (₹{space.pricePerHour}/hr × {duration} hrs)
                            </div>
                          </div>
                          
                          <div className="flex items-center gap-2">
                            <div className="text-right">
                              <div className="flex items-center gap-1 justify-end">
                                <span className="text-[9px] font-bold text-indigo-500 bg-indigo-50 px-1.5 py-0.5 rounded">AI Score</span>
                                <span className={`text-xs font-black px-1.5 py-0.5 rounded ${
                                  space.aiScore >= 85 ? 'bg-emerald-100 text-emerald-800' : 'bg-indigo-100 text-indigo-800'
                                }`}>
                                  {space.aiScore}
                                </span>
                              </div>
                            </div>
                            <button
                              onClick={(e) => { e.stopPropagation(); handleOpenCheckout(space); }}
                              className="px-3.5 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-md shadow-indigo-100 hover:shadow-indigo-200 transition-colors"
                            >
                              Reserve
                            </button>
                          </div>
                        </div>

                      </div>
                    </div>

                    {/* AI reasons panel expanded if selected */}
                    {isSelected && (
                      <div className="mt-4 pt-3 border-t border-dashed border-gray-100 bg-indigo-50/20 p-3 rounded-xl">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-600 flex items-center gap-1">
                          <Sparkles className="w-3.5 h-3.5" />
                          <span>AI Smart Match Notes</span>
                        </span>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mt-2">
                          {space.recommendationNotes.map((note, idx) => (
                            <div key={idx} className="flex items-start gap-1.5">
                              <span className="text-emerald-600 text-xs">✓</span>
                              <span className="text-[10px] text-gray-600 font-medium leading-normal">{note}</span>
                            </div>
                          ))}
                          <div className="flex items-start gap-1.5">
                            <span className="text-indigo-600 text-xs">➔</span>
                            <span className="text-[10px] text-gray-600 font-medium leading-normal">{space.availabilityProbability}% chance of vacancy forecast</span>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Right Side: LeafletMap and detailed card summary */}
        <div className={`w-full lg:w-2/5 flex flex-col gap-4 ${mobileTab === 'list' ? 'hidden lg:flex' : 'flex'}`}>
          <div className="h-[400px] lg:h-[450px]">
            <GoogleMapComponent
              center={[searchLat, searchLng]}
              spaces={results}
              selectedSpaceId={selectedSpaceId}
              onSelectSpace={handleSelectSpace}
              onMapClick={handleMapClick}
              onAutocompleteSelect={handleAutocompleteSelect}
            />
          </div>

          {/* Detailed Selected Card details display */}
          {selectedSpaceDetail && (
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 flex flex-col gap-3">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-extrabold text-sm text-gray-900">{selectedSpaceDetail.name}</h3>
                  <p className="text-[11px] text-gray-400 leading-normal mt-0.5">{selectedSpaceDetail.address}</p>
                </div>
                <div className="bg-gray-50 border border-gray-100 rounded-xl px-2.5 py-1 text-center shrink-0">
                  <span className="block text-[8px] text-gray-400 font-bold uppercase">Rate</span>
                  <span className="font-black text-sm text-gray-900">₹{selectedSpaceDetail.pricePerHour}</span>
                  <span className="text-[10px] text-gray-400 font-bold">/h</span>
                </div>
              </div>

              <p className="text-xs text-gray-600 leading-relaxed bg-gray-50 p-3 rounded-xl border border-gray-100/50">
                {selectedSpaceDetail.description || 'No description provided.'}
              </p>

              <div className="grid grid-cols-3 gap-2 mt-1.5">
                <div className="bg-gray-50/60 p-2.5 rounded-xl border border-gray-100/50 flex flex-col gap-0.5">
                  <span className="text-[9px] uppercase font-bold text-gray-400">Vehicle Type</span>
                  <span className="text-[11px] font-bold text-gray-700">
                    {selectedSpaceDetail.vehicleType === 'BOTH' ? 'Cars & Bikes' : selectedSpaceDetail.vehicleType === 'FOUR_WHEELER' ? 'Cars Only' : 'Bikes Only'}
                  </span>
                </div>
                <div className="bg-gray-50/60 p-2.5 rounded-xl border border-gray-100/50 flex flex-col gap-0.5">
                  <span className="text-[9px] uppercase font-bold text-gray-400">Capacity</span>
                  <span className="text-[11px] font-bold text-gray-700">{selectedSpaceDetail.capacity} Vehicles</span>
                </div>
                <div className="bg-gray-50/60 p-2.5 rounded-xl border border-gray-100/50 flex flex-col gap-0.5">
                  <span className="text-[9px] uppercase font-bold text-gray-400">Dimensions</span>
                  <span className="text-[11px] font-bold text-violet-700 flex items-center gap-1">
                    <Ruler className="w-3.5 h-3.5 text-violet-500" />
                    <span>{selectedSpaceDetail.dimensions || '18 x 9 ft'}</span>
                  </span>
                </div>
              </div>

              {/* Environment & Operating Hours */}
              <div className="grid grid-cols-2 gap-2">
                <div className="bg-gray-50/60 p-2.5 rounded-xl border border-gray-100/50 flex flex-col gap-0.5">
                  <span className="text-[9px] uppercase font-bold text-gray-400">Environment</span>
                  <span className="text-[11px] font-bold text-gray-700">
                    {selectedSpaceDetail.parkingType === 'INDOOR' ? '🏢 Indoor Basement' : '☀️ Outdoor Open-Air'}
                  </span>
                </div>
                <div className="bg-gray-50/60 p-2.5 rounded-xl border border-gray-100/50 flex flex-col gap-0.5">
                  <span className="text-[9px] uppercase font-bold text-gray-400">Operating Hours</span>
                  <span className="text-[11px] font-bold text-amber-700">
                    {selectedSpaceDetail.operatingHours || '06:00 AM - 11:00 PM'}
                  </span>
                </div>
              </div>

              {/* Spot Amenities & Features Checklist Badges */}
              {selectedSpaceDetail.features && (
                <div className="space-y-1.5">
                  <span className="text-[9px] uppercase font-extrabold text-gray-400">Spot Amenities & Security</span>
                  <div className="flex flex-wrap gap-1.5">
                    {selectedSpaceDetail.features.split(',').map((feat, idx) => (
                      <span key={idx} className="text-[10px] font-bold text-indigo-700 bg-indigo-50 px-2.5 py-1 rounded-lg border border-indigo-100/50 flex items-center gap-1">
                        <ShieldCheck className="w-3 h-3 text-indigo-500" />
                        <span>{feat.trim()}</span>
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Verified Driver Reviews & Comments */}
              <div className="space-y-2 pt-2 border-t border-gray-100">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] uppercase font-extrabold text-gray-400 flex items-center gap-1">
                    <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                    <span>Customer Reviews ({selectedSpaceDetail.reviews?.length || selectedSpaceDetail.reviewCount || 0})</span>
                  </span>
                  <span className="text-xs font-black text-gray-800">{selectedSpaceDetail.rating.toFixed(1)} ★</span>
                </div>
                <div className="space-y-2 max-h-40 overflow-y-auto pr-1">
                  {(!selectedSpaceDetail.reviews || selectedSpaceDetail.reviews.length === 0) ? (
                    <p className="text-[11px] text-gray-400 italic">No customer reviews written yet for this location.</p>
                  ) : (
                    selectedSpaceDetail.reviews.map((rev: any, idx: number) => (
                      <div key={rev.id || idx} className="bg-gray-50/80 p-2.5 rounded-xl border border-gray-100 flex flex-col gap-1">
                        <div className="flex items-center justify-between">
                          <span className="text-[11px] font-bold text-gray-800">{rev.driver?.name || 'Verified User'}</span>
                          <span className="text-[10px] font-bold text-amber-500">{'★'.repeat(rev.rating)}</span>
                        </div>
                        <p className="text-[11px] text-gray-600 leading-snug">{rev.comment}</p>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* Real-time availability forecast details */}
              <div className="bg-indigo-50/30 border border-indigo-100/30 rounded-xl p-3 flex flex-col gap-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] uppercase font-extrabold text-indigo-600 tracking-wider flex items-center gap-1">
                    <Info className="w-3.5 h-3.5" />
                    <span>Real-time Vacancy Model</span>
                  </span>
                  <span className="text-xs font-black text-indigo-700">{selectedSpaceDetail.availabilityProbability}% availability</span>
                </div>
                <div className="space-y-1">
                  {selectedSpaceDetail.availabilityExplanation.map((exp, idx) => (
                    <p key={idx} className="text-[9px] text-gray-500 leading-normal flex items-start gap-1">
                      <span className="text-indigo-400">•</span>
                      <span>{exp}</span>
                    </p>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

      </div>

      {/* Booking Checkout Drawer/Modal */}
      {checkoutSpace && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full overflow-hidden border border-gray-100 animate-in fade-in zoom-in-95 duration-200">
            
            {/* Success Confirmed Panel */}
            {bookingConfirmed ? (
              <div className="p-8 text-center flex flex-col items-center">
                <div className="w-16 h-16 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600 mb-4 animate-bounce">
                  <ShieldCheck className="w-8 h-8" />
                </div>
                <h3 className="text-xl font-black text-gray-900">Reservation Confirmed!</h3>
                <p className="text-xs text-gray-500 mt-2 max-w-sm leading-relaxed">
                  Your payment has been verified on the backend. Your slot at <span className="font-bold text-gray-800">{checkoutSpace.name}</span> is reserved.
                </p>
                <div className="bg-gray-50 border border-gray-100 p-4 rounded-2xl w-full my-6 flex flex-col gap-2">
                  <div className="flex justify-between text-xs">
                    <span className="text-gray-400">Date</span>
                    <span className="font-semibold text-gray-800">{date}</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-gray-400">Schedule</span>
                    <span className="font-semibold text-gray-800">{startTime} ({duration} hours)</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-gray-400">Booking Passcode</span>
                    <span className="font-mono font-bold text-indigo-600">{bookingResponse?.qrCode?.substring(0, 15)}...</span>
                  </div>
                </div>
                <button
                  onClick={() => { setCheckoutSpace(null); navigate('/driver/bookings'); }}
                  className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3.5 rounded-xl text-sm transition-all shadow-md shadow-indigo-100 hover:shadow-indigo-200"
                >
                  Go to My Bookings
                </button>
              </div>
            ) : (
              <div className="p-6">
                <div className="flex justify-between items-start pb-4 border-b border-gray-100">
                  <div>
                    <span className="text-[9px] uppercase font-black text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-full">Reservation Request</span>
                    <h3 className="text-base font-extrabold text-gray-900 mt-1">{checkoutSpace.name}</h3>
                    <p className="text-[10px] text-gray-400 mt-0.5">{checkoutSpace.address}</p>
                  </div>
                  <button onClick={() => setCheckoutSpace(null)} className="text-gray-400 hover:text-gray-600 font-bold text-sm">✕</button>
                </div>

                {/* Event Demand warning warnings */}
                {checkoutSpace.trafficLevel !== 'LOW' && (
                  <div className="bg-amber-50 border border-amber-100 rounded-xl p-3.5 flex items-start gap-2.5 my-4">
                    <AlertTriangle className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
                    <div>
                      <h5 className="text-xs font-bold text-amber-800">High Local Demand Overlay</h5>
                      <p className="text-[10px] text-amber-700 leading-normal mt-0.5">
                        Congestion level is predicted as <span className="font-bold">{checkoutSpace.trafficLevel}</span>. We strongly recommend leaving 10 minutes early.
                      </p>
                    </div>
                  </div>
                )}

                {/* Cost Sheet */}
                <div className="bg-gray-50 border border-gray-100 p-4.5 rounded-2xl mt-4 flex flex-col gap-2.5">
                  <h4 className="text-[10px] uppercase font-black tracking-wider text-gray-400">Booking Summary</h4>
                  <div className="flex justify-between text-xs">
                    <span className="text-gray-500">₹{checkoutSpace.pricePerHour} × {duration} hours</span>
                    <span className="font-semibold text-gray-800">₹{checkoutSpace.pricePerHour * parseFloat(duration)}</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-gray-500 flex items-center gap-1">
                      <span>Platform Fee (15%)</span>
                      <HelpCircle className="w-3.5 h-3.5 text-gray-300" title="Includes system maintenance, security verification, and gateway costs" />
                    </span>
                    <span className="font-semibold text-gray-800">₹{Math.round(checkoutSpace.pricePerHour * parseFloat(duration) * 0.15)}</span>
                  </div>
                  <div className="h-px bg-gray-200/60 my-1"></div>
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-bold text-gray-900">Total Payable</span>
                    <span className="text-lg font-black text-indigo-600">₹{Math.round((checkoutSpace.pricePerHour * parseFloat(duration)) * 1.15)}</span>
                  </div>
                </div>

                <div className="bg-indigo-50/20 border border-indigo-100/30 rounded-xl p-3.5 mt-4 flex items-start gap-2.5">
                  <Clock className="w-4.5 h-4.5 text-indigo-500 shrink-0 mt-0.5" />
                  <div>
                    <h5 className="text-[11px] font-bold text-indigo-900">Schedule Duration Lock</h5>
                    <p className="text-[9px] text-indigo-700/80 leading-normal mt-0.5">
                      Reserved from {startTime} to {new Date(new Date(`${date}T${startTime}`).getTime() + parseFloat(duration)*3600000).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})} on {date}.
                    </p>
                  </div>
                </div>

                <button
                  onClick={handleConfirmReservation}
                  disabled={creatingBooking}
                  className="w-full mt-6 bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3.5 rounded-xl text-sm transition-all shadow-md shadow-indigo-100 hover:shadow-indigo-200 flex items-center justify-center gap-1.5"
                >
                  {creatingBooking ? (
                    <div className="w-4 h-4 rounded-full border-2 border-white border-t-indigo-600 animate-spin"></div>
                  ) : (
                    'Proceed to Payment'
                  )}
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Razorpay Checkout Portal simulator overlay */}
      <RazorpaySim
        isOpen={showPayment}
        orderData={paymentOrder}
        onCancel={() => setShowPayment(false)}
        onSuccess={handlePaymentSuccess}
      />

    </div>
  );
};
export default DriverDashboard;
