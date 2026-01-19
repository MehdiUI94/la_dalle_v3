// Mock pour DeviceEventEmitter sur le web
class MockEventEmitter {
  emit() {
    return false
  }
  addListener() {
    return () => {}
  }
  removeListener() {
    return this
  }
  removeAllListeners() {
    return this
  }
}

const mockEmitter = new MockEventEmitter()

// Exporter comme default avec une propriété default pour compatibilité
const DeviceEventEmitter = Object.assign(mockEmitter, {
  default: mockEmitter,
})

export default DeviceEventEmitter
