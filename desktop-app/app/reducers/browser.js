// @flow
import {
  NEW_ADDRESS,
  NEW_ZOOM_LEVEL,
  NEW_SCROLL_POSITION,
  NEW_NAVIGATOR_STATUS,
  NEW_DRAWER_CONTENT,
  NEW_PREVIEWER_CONFIG,
  NEW_ACTIVE_DEVICES,
  NEW_ACTIVE_DEVICE,
  NEW_FILTERS,
  NEW_HOMEPAGE,
} from '../actions/browser';
import type {Action} from './types';
import devices from '../constants/devices';
import settings from 'electron-settings';
import type {Device} from '../constants/devices';
import {
  FLEXIGRID_LAYOUT,
  INDIVIDUAL_LAYOUT,
} from '../constants/previewerLayouts';
import {DEVICE_MANAGER} from '../constants/DrawerContents';
import {ACTIVE_DEVICES} from '../constants/settingKeys';
import {isIfStatement} from 'typescript';
import {getHomepage, saveHomepage} from '../utils/navigatorUtils';

export const FILTER_FIELDS = {
  OS: 'OS',
  DEVICE_TYPE: 'DEVICE_TYPE',
};

type ScrollPositionType = {
  x: number,
  y: number,
};

type NavigatorStatusType = {
  backEnabled: boolean,
  forwardEnabled: boolean,
};

type DrawerType = {
  open: boolean,
  content: string,
};

type PreviewerType = {
  layout: string,
};

type FilterFieldType = FILTER_FIELDS.OS | FILTER_FIELDS.DEVICE_TYPE;

type FilterType = {[key: FilterFieldType]: Array<string>};

export type BrowserStateType = {
  devices: Array<Device>,
  homepage: string,
  address: string,
  zoomLevel: number,
  scrollPosition: ScrollPositionType,
  navigatorStatus: NavigatorStatusType,
  drawer: DrawerType,
  previewer: PreviewerType,
  filters: FilterType,
};

let _activeDevices = null;

function _saveActiveDevices(devices) {
  settings.set(ACTIVE_DEVICES, devices);
  _activeDevices = devices;
}

function _getActiveDevices() {
  if (_activeDevices) {
    return _activeDevices;
  }
  let activeDevices = settings.get(ACTIVE_DEVICES);
  if (!activeDevices) {
    activeDevices = devices.filter(device => device.added);
    _saveActiveDevices(activeDevices);
  }
  return activeDevices;
}

export default function counter(
  state: BrowserStateType = {
    devices: _getActiveDevices(),
    homepage: getHomepage(),
    address: getHomepage(),
    zoomLevel: 0.6,
    previousZoomLevel: null,
    scrollPosition: {x: 0, y: 0},
    navigatorStatus: {backEnabled: false, forwardEnabled: false},
    drawer: {open: true, content: DEVICE_MANAGER},
    previewer: {layout: FLEXIGRID_LAYOUT},
    filters: {[FILTER_FIELDS.OS]: [], [FILTER_FIELDS.DEVICE_TYPE]: []},
  },
  action: Action
) {
  switch (action.type) {
    case NEW_ADDRESS:
      return {...state, address: action.address};
    case NEW_HOMEPAGE:
      const {homepage} = action;
      saveHomepage(homepage);
      return {...state, homepage};
    case NEW_ZOOM_LEVEL:
      return {...state, zoomLevel: action.zoomLevel};
    case NEW_SCROLL_POSITION:
      return {...state, scrollPosition: action.scrollPosition};
    case NEW_NAVIGATOR_STATUS:
      return {...state, navigatorStatus: action.navigatorStatus};
    case NEW_DRAWER_CONTENT:
      return {...state, drawer: action.drawer};
    case NEW_PREVIEWER_CONFIG:
      const updateObject = {previewer: action.previewer};
      if (
        state.previewer.layout !== INDIVIDUAL_LAYOUT &&
        action.previewer.layout === INDIVIDUAL_LAYOUT
      ) {
        updateObject.zoomLevel = 1;
        updateObject.previousZoomLevel = state.zoomLevel;
      }
      if (
        state.previewer.layout === INDIVIDUAL_LAYOUT &&
        action.previewer.layout !== INDIVIDUAL_LAYOUT
      ) {
        updateObject.zoomLevel = state.previousZoomLevel;
        updateObject.previousZoomLevel = null;
      }
      return {...state, ...updateObject};
    case NEW_ACTIVE_DEVICES:
      _saveActiveDevices(action.devices);
      return {...state, devices: action.devices};
    case NEW_ACTIVE_DEVICE:
      const devices = [...state.devices, action.device];
      _saveActiveDevices(devices);
      return {...state, devices};
    case NEW_FILTERS:
      return {...state, filters: action.filters};
    default:
      return state;
  }
}
