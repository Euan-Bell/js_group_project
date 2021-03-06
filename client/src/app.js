const Cryptid = require('./models/cryptid.js');
const CryptidView = require('./views/cryptid_view.js');
const MapView = require('./views/map_view.js');
const DirectoryView = require('./views/directory_view.js');
const SelectView = require('./views/select_view.js');
const AboutView = require('./views/about_view.js');

document.addEventListener('DOMContentLoaded', () => {
  console.log('Javascript Loaded');

  const url = 'http://localhost:3000/api/cryptids';
  const cryptid = new Cryptid(url);
  cryptid.getData();
  cryptid.bindEvents();
  cryptid.showCryptidOnSidebar();
  cryptid.reloadSidebar();

  const mapView = new MapView();
  mapView.renderMap();
  mapView.renderSidebar();
  mapView.bindEvents();
  mapView.zoomIn();
  mapView.zoomToOriginMap();

  const container = document.querySelector('#sidebar-list')
  const directoryView = new DirectoryView(container);
  directoryView.bindEvents();

  const cryptidView = new CryptidView(container);
  cryptidView.bindEvents();

  const continentSelectContainer = document.querySelector('#continents');
  const countrySelectContainer = document.querySelector('#countries');
  const habitatSelectContainer = document.querySelector('#habitats');
  const typeSelectContainer = document.querySelector('#types');
  const selectView = new SelectView(continentSelectContainer, countrySelectContainer, habitatSelectContainer, typeSelectContainer);
  selectView.bindEvents();

  const aboutView = new AboutView();
  aboutView.bindEvents();

});
