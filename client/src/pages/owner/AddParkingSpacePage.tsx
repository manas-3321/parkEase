import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { ShieldCheck, BrainCircuit, Sparkles, AlertTriangle, Eye, Loader2, ClipboardList, Camera, UploadCloud, Ruler, Image as ImageIcon, LocateFixed } from 'lucide-react';
import confetti from 'canvas-confetti';

export const AddParkingSpacePage: React.FC = () => {
  const { apiFetch } = useAuth();
  const navigate = useNavigate();

  // Form States
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [address, setAddress] = useState('');
  const [latitude, setLatitude] = useState('');
  const [longitude, setLongitude] = useState('');
  const [pricePerHour, setPricePerHour] = useState('40');
  const [capacity, setCapacity] = useState('2');
  const [vehicleType, setVehicleType] = useState('BOTH');
  const [dimensions, setDimensions] = useState('18 x 9 ft (Standard SUV)');
  const [imageUrl, setImageUrl] = useState('');
  const [parkingType, setParkingType] = useState<'INDOOR' | 'OUTDOOR'>('OUTDOOR');
  const [operatingHours, setOperatingHours] = useState('06:00 AM - 11:00 PM');
  const [selectedFeatures, setSelectedFeatures] = useState<string[]>([
    'CCTV 24/7 Security',
    'Secured Gated Entrance',
    'Night Floodlighting',
    'Animal Protection Spikes',
  ]);

  const availableFeatureList = [
    'CCTV 24/7 Security',
    'Secured Gated Entrance',
    'Animal Protection Spikes (Prevent dogs/cats sitting on vehicle)',
    'Night Floodlighting',
    'EV Fast Charger Station',
    'On-Site Security Guard',
    'Ground Level Access',
    'Automated Boom Barrier',
  ];

  const toggleFeature = (featureName: string) => {
    if (selectedFeatures.includes(featureName)) {
      setSelectedFeatures(selectedFeatures.filter((f) => f !== featureName));
    } else {
      setSelectedFeatures([...selectedFeatures, featureName]);
    }
  };

  // Location detection state
  const [locatingUser, setLocatingUser] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const handleUseCurrentLocation = () => {
    setFormError(null);
    if (!navigator.geolocation) {
      setFormError('Geolocation is not supported by your browser.');
      return;
    }

    setLocatingUser(true);

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const lat = position.coords.latitude;
        const lng = position.coords.longitude;

        setLatitude(lat.toFixed(6));
        setLongitude(lng.toFixed(6));

        try {
          const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18`);
          const data = await res.json();
          if (data && data.display_name) {
            setAddress(data.display_name);
          } else {
            setAddress(`Gated Property near (${lat.toFixed(4)}, ${lng.toFixed(4)})`);
          }
        } catch {
          setAddress(`Gated Property near (${lat.toFixed(4)}, ${lng.toFixed(4)})`);
        } finally {
          setLocatingUser(false);
        }
      },
      (err) => {
        setLocatingUser(false);
        setFormError(`Location permission denied or GPS error: ${err.message}`);
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  // AI Loading & Result Overlay
  const [scanning, setScanning] = useState(false);
  const [scanResult, setScanResult] = useState<any>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setFormError('Please select a valid image file.');
      return;
    }

    setFormError(null);
    const reader = new FileReader();
    reader.onload = () => {
      if (reader.result) {
        setImageUrl(reader.result.toString());
      }
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    if (!imageUrl) {
      setFormError('Please upload a photo from your gallery or take a picture using your camera.');
      return;
    }

    setScanning(true);
    setScanResult(null);

    try {
      const response = await apiFetch('/api/parking', {
        method: 'POST',
        body: JSON.stringify({
          name,
          description,
          address,
          latitude,
          longitude,
          pricePerHour,
          capacity,
          vehicleType,
          dimensions,
          imageUrl,
          parkingType,
          operatingHours,
          features: selectedFeatures.join(', '),
        }),
      });

      setScanResult(response.verification);

      if (response.verification.status === 'VERIFIED') {
        confetti({
          particleCount: 100,
          spread: 60,
          origin: { y: 0.6 },
        });
      }

    } catch (err: any) {
      setFormError(err.message || 'Failed to list parking space.');
      setScanning(false);
    }
  };

  const handleFinish = () => {
    setScanning(false);
    setScanResult(null);
    navigate('/owner');
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-gray-50 dark:bg-slate-900 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto bg-white dark:bg-slate-800 rounded-3xl border border-gray-100 dark:border-slate-700 shadow-sm p-8 sm:p-10 space-y-8">
        
        <div className="border-b border-gray-100 dark:border-slate-700 pb-5">
          <h2 className="text-2xl font-black text-gray-900 dark:text-white tracking-tight flex items-center gap-2.5">
            <ClipboardList className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
            <span>List Your Parking Space</span>
          </h2>
          <p className="text-xs text-gray-400 dark:text-gray-400 mt-1.5 leading-relaxed">Provide pricing, space dimensions, location details, and upload a photo from your gallery or camera.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          
          {formError && (
            <div className="p-4 bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-900 rounded-2xl text-rose-700 dark:text-rose-300 text-xs font-semibold flex items-center gap-2.5 animate-in fade-in slide-in-from-top-2">
              <AlertTriangle className="w-5 h-5 text-rose-500 shrink-0" />
              <span>{formError}</span>
            </div>
          )}
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div>
              <label className="text-[11px] uppercase font-black text-gray-400 dark:text-gray-400 block mb-1.5">Space Listing Name</label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-4 py-2.5 border border-gray-200 dark:border-slate-700 dark:bg-slate-900 dark:text-white rounded-xl text-xs font-semibold focus:outline-none focus:border-indigo-600 transition-colors"
                placeholder="e.g. Front Gate Private Driveway"
              />
            </div>
            <div>
              <label className="text-[11px] uppercase font-black text-gray-400 dark:text-gray-400 block mb-1.5">Vehicle Allowed</label>
              <select
                value={vehicleType}
                onChange={(e) => setVehicleType(e.target.value)}
                className="w-full px-4 py-2.5 border border-gray-200 dark:border-slate-700 dark:bg-slate-900 dark:text-white rounded-xl text-xs font-semibold focus:outline-none focus:border-indigo-600 transition-colors"
              >
                <option value="BOTH">Cars & Bikes (Both)</option>
                <option value="FOUR_WHEELER">Cars Only</option>
                <option value="TWO_WHEELER">Bikes Only</option>
              </select>
            </div>
          </div>

          {/* Indoor vs Outdoor Parking Lot Environment */}
          <div>
            <label className="text-[11px] uppercase font-black text-gray-400 dark:text-gray-400 block mb-1.5">Parking Environment Type</label>
            <div className="grid grid-cols-2 gap-4">
              <button
                type="button"
                onClick={() => setParkingType('OUTDOOR')}
                className={`p-3.5 rounded-xl border text-xs font-bold flex items-center justify-center gap-2 transition-all ${
                  parkingType === 'OUTDOOR'
                    ? 'bg-indigo-50 border-indigo-300 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 shadow-xs'
                    : 'bg-white dark:bg-slate-900 border-gray-200 dark:border-slate-700 text-gray-600 dark:text-gray-300'
                }`}
              >
                <span>Outdoor / Open-Air</span>
              </button>
              <button
                type="button"
                onClick={() => setParkingType('INDOOR')}
                className={`p-3.5 rounded-xl border text-xs font-bold flex items-center justify-center gap-2 transition-all ${
                  parkingType === 'INDOOR'
                    ? 'bg-indigo-50 border-indigo-300 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 shadow-xs'
                    : 'bg-white dark:bg-slate-900 border-gray-200 dark:border-slate-700 text-gray-600 dark:text-gray-300'
                }`}
              >
                <span>Indoor / Covered Basement</span>
              </button>
            </div>
          </div>

          {/* Operating Time Slot Range */}
          <div>
            <label className="text-[11px] uppercase font-black text-gray-400 dark:text-gray-400 block mb-1.5">User Accessible Operating Hours</label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-1">
              <select
                value={operatingHours}
                onChange={(e) => setOperatingHours(e.target.value)}
                className="w-full px-4 py-2.5 border border-gray-200 dark:border-slate-700 dark:bg-slate-900 dark:text-white rounded-xl text-xs font-semibold focus:outline-none focus:border-indigo-600 transition-colors"
              >
                <option value="24/7 All Day Access">24/7 All Day Access (24 Hours)</option>
                <option value="06:00 AM - 11:00 PM">06:00 AM - 11:00 PM (Standard Day/Night)</option>
                <option value="07:00 AM - 10:00 PM">07:00 AM - 10:00 PM (Daytime Only)</option>
                <option value="08:00 AM - 08:00 PM">08:00 AM - 08:00 PM (Commercial Hours)</option>
                <option value="10:00 PM - 06:00 AM">10:00 PM - 06:00 AM (Overnight Access Only)</option>
              </select>
              <input
                type="text"
                value={operatingHours}
                onChange={(e) => setOperatingHours(e.target.value)}
                className="w-full px-4 py-2.5 border border-gray-200 dark:border-slate-700 dark:bg-slate-900 dark:text-white rounded-xl text-xs font-semibold focus:outline-none focus:border-indigo-600 transition-colors"
                placeholder="Or custom range (e.g. 05:30 AM - 11:30 PM)"
              />
            </div>
            <p className="text-[10px] text-gray-400 dark:text-gray-400">Specifies what hours users are allowed to enter and park at your spot.</p>
          </div>

          {/* Interactive Feature Checklist Options */}
          <div>
            <label className="text-[11px] uppercase font-black text-gray-400 dark:text-gray-400 block mb-1.5">Select Spot Amenities & Features</label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-52 overflow-y-auto p-1">
              {availableFeatureList.map((feature, idx) => {
                const isChecked = selectedFeatures.includes(feature);
                return (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => toggleFeature(feature)}
                    className={`p-2.5 rounded-xl border text-left text-xs font-semibold flex items-center gap-2.5 transition-all ${
                      isChecked
                        ? 'bg-indigo-50 border-indigo-300 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 font-bold'
                        : 'bg-white dark:bg-slate-900 border-gray-200 dark:border-slate-700 text-gray-600 dark:text-gray-400'
                    }`}
                  >
                    <span className={`w-4 h-4 rounded-md border flex items-center justify-center text-[10px] shrink-0 ${isChecked ? 'bg-indigo-600 border-indigo-600 text-white' : 'border-gray-300 bg-white'}`}>
                      {isChecked ? '✓' : ''}
                    </span>
                    <span className="leading-snug">{feature}</span>
                  </button>
                );
              })}
            </div>
          </div>

          <div>
            <div className="flex justify-between items-center mb-1.5">
              <label className="text-[11px] uppercase font-black text-gray-400 dark:text-gray-400">Street Address</label>
              <button
                type="button"
                onClick={handleUseCurrentLocation}
                disabled={locatingUser}
                className="text-[11px] font-bold text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 flex items-center gap-1.5 transition-colors disabled:opacity-50"
                title="Detect my current GPS coordinates & street address"
              >
                <LocateFixed className={`w-3.5 h-3.5 ${locatingUser ? 'animate-spin' : ''}`} />
                <span>{locatingUser ? 'Locating Property...' : 'Use My Current Location'}</span>
              </button>
            </div>
            <input
              type="text"
              required
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              className="w-full px-4 py-2.5 border border-gray-200 dark:border-slate-700 dark:bg-slate-900 dark:text-white rounded-xl text-xs font-semibold focus:outline-none focus:border-indigo-600 transition-colors"
              placeholder="Enter street address or click 'Use My Current Location' above"
            />
          </div>

          {/* Location Coordinates & Rates Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div>
              <label className="text-[11px] uppercase font-black text-gray-400 dark:text-gray-400 block mb-1.5">Latitude</label>
              <input
                type="text"
                required
                value={latitude}
                onChange={(e) => setLatitude(e.target.value)}
                className="w-full px-4 py-2.5 border border-gray-200 dark:border-slate-700 dark:bg-slate-900 dark:text-white rounded-xl text-xs font-semibold focus:outline-none focus:border-indigo-600 transition-colors"
                placeholder="e.g. 28.6320"
              />
            </div>
            <div>
              <label className="text-[11px] uppercase font-black text-gray-400 dark:text-gray-400 block mb-1.5">Longitude</label>
              <input
                type="text"
                required
                value={longitude}
                onChange={(e) => setLongitude(e.target.value)}
                className="w-full px-4 py-2.5 border border-gray-200 dark:border-slate-700 dark:bg-slate-900 dark:text-white rounded-xl text-xs font-semibold focus:outline-none focus:border-indigo-600 transition-colors"
                placeholder="e.g. 77.4490"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div>
              <label className="text-[11px] uppercase font-black text-gray-400 dark:text-gray-400 block mb-1.5">Rate (₹/hour)</label>
              <input
                type="number"
                required
                value={pricePerHour}
                onChange={(e) => setPricePerHour(e.target.value)}
                className="w-full px-4 py-2.5 border border-gray-200 dark:border-slate-700 dark:bg-slate-900 dark:text-white rounded-xl text-xs font-semibold focus:outline-none focus:border-indigo-600 transition-colors"
              />
            </div>
            <div>
              <label className="text-[11px] uppercase font-black text-gray-400 dark:text-gray-400 block mb-1.5">Capacity</label>
              <input
                type="number"
                required
                value={capacity}
                onChange={(e) => setCapacity(e.target.value)}
                className="w-full px-4 py-2.5 border border-gray-200 dark:border-slate-700 dark:bg-slate-900 dark:text-white rounded-xl text-xs font-semibold focus:outline-none focus:border-indigo-600 transition-colors"
              />
            </div>
          </div>

          <div>
            <label className="text-[11px] uppercase font-black text-gray-400 dark:text-gray-400 block mb-1.5">Space Dimensions (Length x Width)</label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Dropdown Preset Selector */}
              <div className="relative">
                <Ruler className="absolute left-3.5 top-3 w-4 h-4 text-violet-500 pointer-events-none" />
                <select
                  onChange={(e) => {
                    if (e.target.value !== 'CUSTOM' && e.target.value !== '') {
                      setDimensions(e.target.value);
                    }
                  }}
                  className="w-full pl-10 pr-4 py-2.5 border border-gray-200 dark:border-slate-700 dark:bg-slate-900 dark:text-white rounded-xl text-xs font-semibold focus:outline-none focus:border-indigo-600 transition-colors"
                >
                  <option value="">-- Select Car/Bike Size Preset --</option>
                  <option value="15 x 7 ft (Hatchback - Swift, i20, WagonR)">Hatchback / Small Car (15 x 7 ft)</option>
                  <option value="17 x 8 ft (Sedan - City, Verna, Dzire)">Standard Sedan (17 x 8 ft)</option>
                  <option value="19 x 9 ft (Mid/Large SUV - Creta, Fortuner)">Mid/Large SUV (19 x 9 ft)</option>
                  <option value="21 x 10 ft (Luxury SUV - BMW X5, Audi Q7)">Luxury SUV / Extra Wide (21 x 10 ft)</option>
                  <option value="9 x 4 ft (Bike/Scooter - Activa, RE, Pulsar)">Two-Wheeler / Bike (9 x 4 ft)</option>
                  <option value="12 x 6 ft (Multi-Bike Bay - 2-4 Bikes)">Multi-Bike Bay (12 x 6 ft)</option>
                  <option value="CUSTOM">Custom Dimension (Type manually)</option>
                </select>
              </div>

              {/* Input for selected/custom dimension */}
              <input
                type="text"
                required
                value={dimensions}
                onChange={(e) => setDimensions(e.target.value)}
                className="w-full px-4 py-2.5 border border-gray-200 dark:border-slate-700 dark:bg-slate-900 dark:text-white rounded-xl text-xs font-semibold focus:outline-none focus:border-indigo-600 transition-colors"
                placeholder="Dimension value (e.g. 18 x 9 ft)"
              />
            </div>
            <p className="text-[10px] text-gray-400 dark:text-gray-400 mt-1.5">Select a pre-filled bike/car category above or type your exact driveway measurements.</p>
          </div>

          <div>
            <label className="text-[11px] uppercase font-black text-gray-400 dark:text-gray-400 block mb-1.5">Listing Photo (Camera or Device Gallery)</label>
            
            {/* Hidden file inputs */}
            <input
              id="camera-file-input"
              type="file"
              accept="image/*"
              capture="environment"
              className="hidden"
              onChange={handleFileUpload}
            />
            <input
              id="gallery-file-input"
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleFileUpload}
            />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-3">
              <button
                type="button"
                onClick={() => document.getElementById('camera-file-input')?.click()}
                className="py-3 px-5 border border-indigo-200 dark:border-indigo-800 bg-indigo-50/60 dark:bg-indigo-950/40 hover:bg-indigo-50 text-indigo-700 dark:text-indigo-300 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-colors shadow-xs"
              >
                <Camera className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                <span>Take Photo (Camera)</span>
              </button>
              <button
                type="button"
                onClick={() => document.getElementById('gallery-file-input')?.click()}
                className="py-3 px-5 border border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-900 hover:bg-gray-100 text-gray-700 dark:text-gray-300 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-colors shadow-xs"
              >
                <UploadCloud className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                <span>Upload from Gallery</span>
              </button>
            </div>

            <input
              type="text"
              required
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
              className="w-full px-4 py-2.5 border border-gray-200 dark:border-slate-700 dark:bg-slate-900 dark:text-white rounded-xl text-xs font-semibold focus:outline-none focus:border-indigo-600 transition-colors"
              placeholder="Or paste direct image URL"
            />

            {imageUrl && (
              <div className="mt-4 relative w-full h-48 rounded-2xl overflow-hidden border border-gray-200 dark:border-slate-700 bg-gray-100 dark:bg-slate-900 shadow-inner">
                <img src={imageUrl} alt="Listing Preview" className="w-full h-full object-cover" />
                <span className="absolute bottom-3 left-3 bg-black/75 text-white text-[10px] font-bold px-3.5 py-1.5 rounded-full backdrop-blur-sm flex items-center gap-2">
                  <ImageIcon className="w-4 h-4 text-indigo-400" />
                  <span>Photo Ready for AI Verification</span>
                </span>
              </div>
            )}
          </div>

          <div>
            <label className="text-[11px] uppercase font-black text-gray-400 dark:text-gray-400 block mb-1.5">Listing Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              className="w-full px-4 py-3 border border-gray-200 dark:border-slate-700 dark:bg-slate-900 dark:text-white rounded-xl text-xs font-medium focus:outline-none focus:border-indigo-600 transition-colors"
              placeholder="Secured gate, proximity markers, CCTV cameras, night lighting details..."
            />
          </div>

          <button
            type="submit"
            className="w-full py-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl font-extrabold text-sm shadow-lg shadow-indigo-200 dark:shadow-indigo-900/30 flex items-center justify-center gap-2.5 transition-all hover:scale-[1.01] active:scale-[0.99] mt-2"
          >
            <ShieldCheck className="w-5 h-5 text-indigo-200" />
            <span>Verify & List Space</span>
          </button>
        </form>
      </div>

      {/* AI verification scanning terminal display modal overlay */}
      {scanning && (
        <div className="fixed inset-0 bg-black/75 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 text-slate-100 rounded-3xl shadow-2xl max-w-md w-full overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            
            {/* Terminal Header */}
            <div className="p-5 border-b border-slate-800 flex justify-between items-center bg-slate-950/40">
              <div className="flex items-center gap-2">
                <BrainCircuit className="w-5 h-5 text-indigo-400" />
                <span className="font-mono text-xs font-bold text-indigo-400 uppercase tracking-widest">Gemini Vision Node</span>
              </div>
              {!scanResult && (
                <div className="flex items-center gap-1">
                  <span className="w-2 h-2 bg-indigo-500 rounded-full animate-ping"></span>
                  <span className="text-[9px] font-mono text-slate-500 uppercase font-black">Analyzing</span>
                </div>
              )}
            </div>

            {/* Terminal output viewport */}
            <div className="p-6 font-mono text-[11px] space-y-4">
              
              {!scanResult ? (
                <div className="space-y-2 py-4">
                  <div className="flex items-center gap-2 text-indigo-300">
                    <Loader2 className="w-4 h-4 animate-spin shrink-0" />
                    <span>[1/3] Extracting image features & spatial bounds...</span>
                  </div>
                  <div className="text-slate-500 pl-6">» Scanning driveway obstacles, gate clearances...</div>
                  <div className="text-slate-500 pl-6">» Evaluating lighting conditions & surface pavement...</div>
                </div>
              ) : (
                <div className="space-y-4 animate-in fade-in duration-300">
                  <div className="p-3.5 rounded-xl border bg-slate-950/60 space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-slate-400">VERIFICATION_STATUS:</span>
                      <span className={`font-bold px-2 py-0.5 rounded text-[10px] ${
                        scanResult.status === 'VERIFIED'
                          ? 'bg-emerald-950 text-emerald-400 border border-emerald-800/50'
                          : scanResult.status === 'REJECTED'
                          ? 'bg-rose-950 text-rose-400 border border-rose-800/50'
                          : 'bg-amber-950 text-amber-400 border border-amber-800/50'
                      }`}>
                        {scanResult.status}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-slate-400">CONFIDENCE_SCORE:</span>
                      <span className="font-bold text-indigo-400">{Math.round(scanResult.confidence * 100)}%</span>
                    </div>
                  </div>

                  {scanResult.details && (
                    <div className="space-y-1 text-[10px] bg-slate-950/40 p-3 rounded-xl border border-slate-800/40">
                      <p className="text-slate-400 flex justify-between">
                        <span>Space Assessment:</span>
                        <span className="text-slate-200">{scanResult.details.spaceAssessment}</span>
                      </p>
                      <p className="text-slate-400 flex justify-between">
                        <span>Obstacle Hazards:</span>
                        <span className="text-slate-200">{scanResult.details.potentialIssues}</span>
                      </p>
                    </div>
                  )}

                  <button
                    onClick={handleFinish}
                    className="w-full mt-2 bg-indigo-600 hover:bg-indigo-500 text-white font-sans font-bold py-3 rounded-xl text-xs transition-all shadow-lg shadow-indigo-600/30"
                  >
                    Done (Return to Dashboard)
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AddParkingSpacePage;
