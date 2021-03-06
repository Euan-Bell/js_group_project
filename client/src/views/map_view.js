const Leaflet = require('leaflet');
const PubSub = require('../helpers/pub_sub.js');
const LeafletSidebar = require('leaflet-sidebar');

const MapView = function() {
  this.cryptids = null
  this.markerLayer = Leaflet.layerGroup([]);
  this.markerArray = [];
  this.myMap = Leaflet.map('map',{
    maxBounds:[ [-80, -160], [120, 160] ],
    zoomControl:false
  }).setView([22, 200], 3);
  // 22 ++ set the map down, 170 ++ set map to the left
}

MapView.prototype.renderMap = function() {

  Leaflet.tileLayer('https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}', {
    attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors, <a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',

    // 1 is max zoom out, 10 is max zoom in. We have locked zoom level to between 6 + 3.

    maxZoom: 9,
    minZoom: 2,
    id: 'mapbox.streets-satellite',
    accessToken: 'pk.eyJ1Ijoiam9tYWxvIiwiYSI6ImNqajlxenFjdjMzZGYza3BndDF0cHJwNG8ifQ.GxdRYwwkA1aQ4I4R1sOt3Q'
  }).addTo(this.myMap);



  Leaflet.control.zoom({
       position:'topright'
  }).addTo(this.myMap);

};

MapView.prototype.bindEvents = function() {
  PubSub.subscribe('Cryptid:data-loaded', (evt) => {
    this.markerArray.forEach((marker) => {
      this.myMap.removeLayer(marker);
    })
    this.markerArray = [];

    this.cryptids = evt.detail;
    console.log('unfiltered objects in cryptids array: ' + this.cryptids.length);

    this.cryptids.forEach((cryptid) => {
      this.renderPin(cryptid);
    })
  });

  PubSub.subscribe('Cryptid:filtered-data-loaded', (evt) => {
    this.markerArray.forEach((marker) => {
      this.myMap.removeLayer(marker);
    })
    this.markerArray = [];

    this.cryptids = evt.detail[0];
    console.log('filtered objects in cryptids array: ' + this.cryptids.length);

    this.cryptids.forEach((cryptid) => {
      this.renderPin(cryptid);
    })
  });
}

MapView.prototype.zoomIn = function(){
  PubSub.subscribe('Cryptid:data-selected',(evt) =>{
    const cryptid = evt.detail;
    const latlong = cryptid[0].coords;
    const marker = Leaflet.marker(latlong);

    this.myMap.setView(latlong,10);

    // still not showing when zoomIn
    marker.unbindPopup();
    const popup = marker.bindPopup("<img src='" + `${cryptid[0].imageSrc}` + "'" + " class='popupImage' " + "/>");
    popup.openPopup();
    console.log(popup);
  });
};

var customIcon = Leaflet.icon({
    iconUrl: '/images/custom_pin_filled2.png',
    iconSize:     [20, 35], // size of the icon
    iconAnchor:   [8, 40], // point of the icon which will correspond to marker's location
    popupAnchor:  [2, -45] // point from which the popup should open relative to the iconAnchor
});

MapView.prototype.renderPin = function(cryptid) {
  const marker = Leaflet.marker(cryptid.coords, {icon: customIcon});
  this.markerArray.push(marker);
  this.markerLayer.addLayer(marker);

  marker.on('click', (evt) => {
    const marker = evt.target;
    const ourMap = evt.target._map;
    const latLong = evt.target._latlng;

    ourMap.setView(latLong, 10);
    // this allows new popup with image to be created after closing previous popup
    marker.unbindPopup();
    const popup = marker.bindPopup("<img src='" + `${cryptid.imageSrc}` + "'" + " class='popupImage' " + "/>");
    popup.openPopup();

    PubSub.publish('MapView: Pin-Selected', cryptid)
  });

  marker.on('mouseover', function(evt){
    marker.unbindPopup();
    marker.bindPopup(`${cryptid.name}`).openPopup();
  })

  marker.addTo(this.myMap)
};


MapView.prototype.renderSidebar = function() {
  const ourSidebar = Leaflet.control.sidebar('sidebar', {
    position: 'left'
  });
  this.myMap.addControl(ourSidebar);
  ourSidebar.show();
};


MapView.prototype.zoomToOriginMap = function () {
  this.myMap.on('click', ()=>{
    this.myMap.setView([22, 200], 2);
    PubSub.publish('MapView:reloadData', this.cryptids);
  });
};

module.exports = MapView;
