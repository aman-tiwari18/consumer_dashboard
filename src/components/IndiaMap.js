import React, { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { createGlobalStyle } from 'styled-components';
import indiageojson from '../resources/india-states.json'; // Local copy of GeoJSON data
// Fix for default markers in Leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

const GlobalMapStyles = createGlobalStyle`
  .leaflet-container {
    background: #f8f9fa;
    font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  }
  
  .info-tooltip {
    background-color: rgba(255, 255, 255, 0.95);
    border: none;
    border-radius: 2px;
    box-shadow: 0 4px 12px rgba(0,0,0,0.15);
    padding: 12px 16px;
    min-width: 120px;
  }
  
  .info-tooltip h4 {
    margin: 0 0 8px;
    color: #333;
    font-size: 16px;
    font-weight: 600;
  }
  
  .info-tooltip .count {
    color: #1976d2;
    font-weight: 600;
    font-size: 14px;
  }
  
  .legend {
    background-color: rgba(255, 255, 255, 0.95);
    border: none;
    border-radius: 2px;
    box-shadow: 0 4px 12px rgba(0,0,0,0.15);
    padding: 12px 16px;
    line-height: 20px;
    font-size: 12px;
  }
  
  .legend h4 {
    margin: 0 0 10px;
    color: #333;
    font-size: 14px;
    font-weight: 600;
  }
  
  .legend i {
    width: 18px;
    height: 18px;
    float: left;
    margin-right: 8px;
    opacity: 0.8;
    border-radius: 2px;
  }
  
  .legend-item {
    margin-bottom: 4px;
    clear: both;
    overflow: hidden;
  }

  .leaflet-popup-content-wrapper {
    border-radius: 2px;
  }

  .leaflet-popup-content {
    margin: 8px 12px;
    font-size: 14px;
  }
`;

const getColor = (d) => {
  return d > 10000 ? '#800026' :
    d > 5000 ? '#BD0026' :
      d > 2000 ? '#E31A1C' :
        d > 1000 ? '#FC4E2A' :
          d > 500 ? '#FD8D3C' :
            d > 200 ? '#FEB24C' :
              d > 50 ? '#FED976' :
                '#FFEDA0';
};

const getIntensity = (count) => {
  if (count > 10000) return 'Very High';
  if (count > 5000) return 'High';
  if (count > 2000) return 'Moderate-High';
  if (count > 1000) return 'Moderate';
  if (count > 500) return 'Low-Moderate';
  if (count > 200) return 'Low';
  if (count > 50) return 'Very Low';
  return 'Minimal';
};

const IndiaMap = ({ data = {}, title = "Complaint Distribution by State" }) => {
  const mapRef = useRef(null);
  const geojsonRef = useRef(null);
  const infoRef = useRef(null);
  const legendRef = useRef(null);

  // format of state names in data for better matching
  console.log("Data received in IndiaMap:", data);

  useEffect(() => {
    const initMap = async () => {
      try {
        // Process the data - normalize state names for better matching
        const processedData = {};
        const stateNameMapping = {
          'ANDHRA PRADESH': ['ANDHRA PRADESH', 'AP'],
          'ARUNACHAL PRADESH': ['ARUNACHAL PRADESH'],
          'ASSAM': ['ASSAM'],
          'BIHAR': ['BIHAR'],
          'CHHATTISGARH': ['CHHATTISGARH', 'CHATTISGARH'],
          'GOA': ['GOA'],
          'GUJARAT': ['GUJARAT'],
          'HARYANA': ['HARYANA'],
          'HIMACHAL PRADESH': ['HIMACHAL PRADESH', 'HP'],
          'JHARKHAND': ['JHARKHAND'],
          'KARNATAKA': ['KARNATAKA'],
          'KERALA': ['KERALA'],
          'MADHYA PRADESH': ['MADHYA PRADESH', 'MP'],
          'MAHARASHTRA': ['MAHARASHTRA'],
          'MANIPUR': ['MANIPUR'],
          'MEGHALAYA': ['MEGHALAYA'],
          'MIZORAM': ['MIZORAM'],
          'NAGALAND': ['NAGALAND'],
          'ODISHA': ['ODISHA', 'ORISSA'],
          'PUNJAB': ['PUNJAB'],
          'RAJASTHAN': ['RAJASTHAN'],
          'SIKKIM': ['SIKKIM'],
          'TAMIL NADU': ['TAMIL NADU', 'TAMILNADU'],
          'TELANGANA': ['TELANGANA'],
          'TRIPURA': ['TRIPURA'],
          'UTTAR PRADESH': ['UTTAR PRADESH', 'UP'],
          'UTTARAKHAND': ['UTTARAKHAND', 'UTTARANCHAL'],
          'WEST BENGAL': ['WEST BENGAL'],
          'DELHI': ['DELHI', 'NEW DELHI', 'NCT OF DELHI'],
          'JAMMU AND KASHMIR': ['JAMMU AND KASHMIR', 'J&K'],
          'LADAKH': ['LADAKH'],
          'CHANDIGARH': ['CHANDIGARH'],
          'PUDUCHERRY': ['PUDUCHERRY', 'PONDICHERRY']
        };

        // Normalize and map data
        if (data && typeof data === 'object') {
          Object.entries(data).forEach(([inputState, count]) => {
            const normalizedInput = inputState.toUpperCase().trim();

            // Find matching canonical state name
            let matched = false;
            for (const [canonical, variations] of Object.entries(stateNameMapping)) {
              if (variations.some(variant => variant === normalizedInput || normalizedInput.includes(variant))) {
                processedData[canonical] = (processedData[canonical] || 0) + (parseInt(count) || 0);
                matched = true;
                break;
              }
            }

            // Fallback - use direct mapping if no match found
            if (!matched) {
              processedData[normalizedInput] = parseInt(count) || 0;
            }
          });
        }

        // Update info function
        const updateInfo = (feature) => {
          if (!infoRef.current) return;

          if (feature) {
            const stateName = feature.properties.NAME_1.toUpperCase();
            const count = processedData[stateName] || 0;
            const intensity = getIntensity(count);

            infoRef.current.innerHTML = `
              <h4>${feature.properties.NAME_1}</h4>
              <div class="count">${count.toLocaleString()} complaints</div>
              <div style="color: #666; font-size: 12px; margin-top: 4px;">${intensity}</div>
            `;
          } else {
            infoRef.current.innerHTML = '<h4>Hover over a state</h4><div style="color: #666;">View complaint data</div>';
          }
        };

        // Initialize map if not already done
        if (!mapRef.current) {
          mapRef.current = L.map('map', {
            center: [23.5937, 90.3629],
            zoom: 10,           // Changed from 8 to 5 for initial zoom
            minZoom: 4.5,        // Changed from 4 to 3 to allow more zooming out
            maxZoom: 12,       // Changed from 10 to 12 to allow more zooming in
            zoomControl: true,
            attributionControl: true
          });

          // Add tile layer with better styling
          L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '© OpenStreetMap contributors',
            maxZoom: 22
          }).addTo(mapRef.current);

          // Add info control
          const info = L.control({ position: 'topright' });
          info.onAdd = () => {
            const div = L.DomUtil.create('div', 'info-tooltip');
            infoRef.current = div;
            updateInfo();
            return div;
          };
          info.addTo(mapRef.current);

          // Add legend control
          const legend = L.control({ position: 'bottomright' });
          legend.onAdd = () => {
            const div = L.DomUtil.create('div', 'legend');
            legendRef.current = div;

            const grades = [0, 50, 200, 500, 1000, 2000, 5000, 10000];
            const labels = ['0-50', '51-200', '201-500', '501-1K', '1K-2K', '2K-5K', '5K-10K', '10K+'];

            div.innerHTML = `<h4>${title.split(' ').slice(0, 2).join(' ')}</h4>`;

            for (let i = 0; i < grades.length; i++) {
              div.innerHTML += `
                <div class="legend-item">
                  <i style="background:${getColor(grades[i] + 1)}"></i>
                  ${labels[i]}
                </div>
              `;
            }
            return div;
          };
          legend.addTo(mapRef.current);
        }

        // Style function for states
        const style = (feature) => {
          const stateName = feature.properties.NAME_1.toUpperCase();
          const count = processedData[stateName] || 0;

          return {
            fillColor: getColor(count),
            weight: 2,
            opacity: 1,
            color: '#ffffff',
            dashArray: '',
            fillOpacity: 0.7
          };
        };

        // Event handlers
        const highlightFeature = (e) => {
          const layer = e.target;

          layer.setStyle({
            weight: 3,
            color: '#333',
            dashArray: '',
            fillOpacity: 0.9
          });

          if (!L.Browser.ie && !L.Browser.opera && !L.Browser.edge) {
            layer.bringToFront();
          }

          updateInfo(layer.feature);
        };

        const resetHighlight = (e) => {
          if (geojsonRef.current) {
            geojsonRef.current.resetStyle(e.target);
          }
          updateInfo();
        };

        const zoomToFeature = (e) => {
          const layer = e.target;
          const feature = layer.feature;
          const stateName = feature.properties.NAME_1;
          const count = processedData[stateName.toUpperCase()] || 0;

          // Show popup with detailed info
          const popupContent = `
            <div style="text-align: center;">
              <h3 style="margin: 0 0 8px; color: #1976d2;">${stateName}</h3>
              <div style="font-size: 18px; font-weight: bold; color: #333;">
                ${count.toLocaleString()} complaints
              </div>
              <div style="color: #666; font-size: 12px; margin-top: 4px;">
                Intensity: ${getIntensity(count)}
              </div>
            </div>
          `;

          layer.bindPopup(popupContent).openPopup();
          mapRef.current.fitBounds(layer.getBounds(), { padding: [20, 20] });
        };

        // Remove existing layer
        if (geojsonRef.current) {
          mapRef.current.removeLayer(geojsonRef.current);
        }

        // Fetch GeoJSON data from GitHub
        // const response = await fetch('https://raw.githubusercontent.com/Subhash9325/GeoJson-Data-of-Indian-States/refs/heads/master/Indian_States');
        const response = { ok: true, json: async () => indiageojson }; // Using local copy

        if (!response.ok) {
          throw new Error(`Failed to fetch GeoJSON data: ${response.status}`);
        }

        const geojsonData = await response.json();

        // Add GeoJSON layer
        geojsonRef.current = L.geoJSON(geojsonData, {
          style: style,
          onEachFeature: (feature, layer) => {
            layer.on({
              mouseover: highlightFeature,
              mouseout: resetHighlight,
              click: zoomToFeature
            });
          }
        }).addTo(mapRef.current);

        // Fit map to show all of India
        mapRef.current.fitBounds(geojsonRef.current.getBounds(), {
          padding: [10, 10]
        });

      } catch (error) {
        console.error('Error initializing map:', error);

        // Show error message in info panel
        if (infoRef.current) {
          infoRef.current.innerHTML = `
            <h4 style="color: red;">Error Loading Map</h4>
            <div style="font-size: 12px; color: #666;">
              Failed to load geographic data. Please check your internet connection.
            </div>
          `;
        }
      }
    };

    initMap();

    // Cleanup function
    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
        geojsonRef.current = null;
        infoRef.current = null;
        legendRef.current = null;
      }
    };
  }, [data, title]);

  return (
    <>
      <GlobalMapStyles />
      <div
        id="map"
        style={{
          height: '700px',
          width: '100%',
          borderRadius: '2px',
          border: '1px solid #e0e0e0',
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
        }}
      />
    </>
  );
};

export default IndiaMap;