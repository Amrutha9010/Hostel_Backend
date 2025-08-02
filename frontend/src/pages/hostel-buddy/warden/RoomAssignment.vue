<template>
  <div class="room-assignment-page">
    <Navbar_warden />
    <div class="main-content">
      <div class="container">
        <div class="page-header">
          <h1>Room Assignment</h1>
        </div>

        <div v-if="applications.length === 0" class="no-applications">
          <i class="fas fa-check-circle"></i>
          <p>No pending applications</p>
        </div>

        <div class="applications-grid">
          <div v-for="application in applications" :key="application._id" class="application-card">
            <div class="card-header">
              <h3>{{ application.fullName }}</h3>
              <span class="roll-number">{{ application.rollNumber }}</span>
            </div>

            <div class="student-details">
              <div class="detail-row">
                <div class="detail-item">
                  <span class="detail-label">Branch/Year:</span>
                  <span class="detail-value">{{ application.branchYear }}</span>
                </div>
                <div class="detail-item">
                  <span class="detail-label">Gender:</span>
                  <span class="detail-value">{{ application.gender }}</span>
                </div>
              </div>

              <div class="detail-row">
                <div class="detail-item">
                  <span class="detail-label">Phone:</span>
                  <span class="detail-value">{{ application.phone }}</span>
                </div>
                <div class="detail-item">
                  <span class="detail-label">Parent Phone:</span>
                  <span class="detail-value">{{ application.parentPhone }}</span>
                </div>
              </div>

              <div class="detail-row">
                <div class="detail-item">
                  <span class="detail-label">Sharing Type:</span>
                  <span class="detail-value">{{ application.sharingType }}</span>
                </div>
                <div class="detail-item">
                  <span class="detail-label">AC Type:</span>
                  <span class="detail-value">{{ application.acType }}</span>
                </div>
              </div>

              <div class="detail-row full-width">
                <div class="detail-item">
                  <span class="detail-label">Address:</span>
                  <span class="detail-value">{{ application.address }}</span>
                </div>
              </div>

              <div class="detail-row full-width">
                <div class="detail-item">
                  <span class="detail-label">Medical Info:</span>
                  <span class="detail-value">{{ application.medicalInfo || 'None' }}</span>
                </div>
              </div>
            </div>

            <div class="documents">
              <div class="doc-preview" @click="openImage(application.studentPhoto)">
                <img :src="application.studentPhoto" alt="Student Photo" />
                <span>Student Photo</span>
              </div>
              <div class="doc-preview" @click="openImage(application.aadhaar)">
                <img :src="application.aadhaar" alt="Aadhaar" />
                <span>Aadhaar Card</span>
              </div>
              <div class="doc-preview" @click="openImage(application.collegeId)">
                <img :src="application.collegeId" alt="College ID" />
                <span>College ID</span>
              </div>
            </div>

            <div class="assignment-controls">
              <button 
                @click="fetchSuitableRooms(application)" 
                class="view-rooms-btn"
              >
                <i class="fas fa-search"></i> Find Suitable Rooms
              </button>
              
              <!-- <div class="room-select">
                <label>Assign Room:</label>
                <select 
                  v-model="assignedRooms[application._id]" 
                  class="form-select"
                >
                  <option disabled value="">Select Room</option>
                  <option 
                    v-for="room in rooms" 
                    :key="room._id" 
                    :value="room.roomNumber"
                  >
                    {{ room.roomNumber }} ({{ room.vacancy }} vacant)
                  </option>
                </select>
              </div>
               -->
              <button 
                @click="approveApplication(application._id)" 
                :disabled="!assignedRooms[application._id]"
                class="assign-btn"
              >
                <i class="fas fa-check"></i> Approve & Assign
              </button>
            </div>
          </div>
        </div>

        <!-- New Suitable Rooms Modal -->
        <div v-if="showRoomModal" class="room-modal">
          <div class="modal-content">
            <button class="close-btn" @click="showRoomModal = false">&times;</button>
            <h3>Available Rooms for {{ selectedApplication.fullName }}</h3>
            
            <div v-if="loadingRooms" class="loading-rooms">
              <i class="fas fa-spinner fa-spin"></i> Loading suitable rooms...
            </div>
            
            <div v-else>
              <div v-if="suitableRooms.length === 0" class="no-rooms">
                No suitable rooms found matching the student's preferences
              </div>
              
              <div v-for="room in suitableRooms" :key="room.roomNo" class="room-option">
                <div class="room-info">
                  <strong>{{ room.roomNo }}</strong> ({{ room.block }}, {{ room.floor }})
                  <div class="availability">
                    Available beds: {{ room.availableBeds }}/{{ room.capacity }}
                  </div>
                </div>
                <button 
                  @click="selectRoom(room.roomNo)" 
                  class="select-room-btn"
                >
                  Select This Room
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    <Footer />
  </div>
</template>
<script>
import axios from 'axios'
import Navbar_warden from '@/components/Navbar_warden.vue'
import Footer from '@/components/Footer.vue'

export default {
  name: 'RoomAssignment',
  components: {
    Navbar_warden,
    Footer
  },
  data() {
    return {
      applications: [],
      rooms: [],
      assignedRooms: {},
      showImageModal: false,
      currentImage: '',
      // New data properties for room selection
      showRoomModal: false,
      selectedApplication: null,
      suitableRooms: [],
      loadingRooms: false
    }
  },
  mounted() {
    this.fetchPendingApplications()
    this.fetchRooms()
  },
  methods: {
    // Existing methods remain unchanged
    async fetchPendingApplications() {
      try {
        const res = await axios.get('/api/room-application?status=Pending')
        this.applications = res.data.data
      } catch (err) {
        console.error('Error fetching applications:', err)
      }
    },
    
    async fetchRooms() {
      try {
        const res = await axios.get('/api/rooms')
        this.rooms = res.data.data
      } catch (err) {
        console.error('Error fetching rooms:', err)
      }
    },
    
    async approveApplication(applicationId) {
      try {
        const assignedRoom = this.assignedRooms[applicationId]
        const res = await axios.put(`/api/room-application/${applicationId}/approve`, {
          assignedRoom
        })
        alert('Student approved and room assigned!')
        this.fetchPendingApplications()
        this.fetchRooms()
      } catch (err) {
        console.error('Approval error:', err)
        alert('Failed to approve student.')
      }
    },
    
    openImage(url) {
      this.currentImage = url
      this.showImageModal = true
    },
    
    // New methods for room selection
    async fetchSuitableRooms(application) {
      this.loadingRooms = true
      this.selectedApplication = application
      try {
        const res = await axios.get(`/api/room-assignment/suitable-rooms/${application._id}`)
        this.suitableRooms = res.data.data
        this.showRoomModal = true
      } catch (err) {
        alert('Failed to fetch suitable rooms: ' + (err.response?.data?.error || err.message))
      } finally {
        this.loadingRooms = false
      }
    },
    
    selectRoom(roomNo) {
      this.assignedRooms[this.selectedApplication._id] = roomNo
      this.showRoomModal = false
    }
  }
}
</script>


<style scoped>
.room-modal {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0,0,0,0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal-content {
  background: white;
  padding: 25px;
  border-radius: 8px;
  width: 90%;
  max-width: 600px;
  max-height: 80vh;
  overflow-y: auto;
  box-shadow: 0 4px 20px rgba(0,0,0,0.15);
}

.close-btn {
  position: absolute;
  top: 15px;
  right: 15px;
  background: none;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
  color: #666;
}

.loading-rooms {
  padding: 20px;
  text-align: center;
  color: #1BBC9B;
}

.no-rooms {
  padding: 20px;
  text-align: center;
  color: #666;
  font-style: italic;
}

.room-option {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 15px;
  margin: 10px 0;
  background: #f9f9f9;
  border-radius: 6px;
  border-left: 4px solid #1BBC9B;
}

.room-info {
  flex: 1;
}

.availability {
  font-size: 0.9rem;
  color: #666;
  margin-top: 5px;
}

.select-room-btn {
  background: #1BBC9B;
  color: white;
  border: none;
  padding: 8px 15px;
  border-radius: 4px;
  cursor: pointer;
  transition: background 0.2s;
}

.select-room-btn:hover {
  background: #16a085;
}

.view-rooms-btn {
  background: #2196F3;
  color: white;
  border: none;
  padding: 8px 15px;
  border-radius: 4px;
  margin-right: 10px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 8px;
  transition: background 0.2s;
}

.view-rooms-btn:hover {
  background: #1976D2;
}

.view-rooms-btn i {
  font-size: 0.9rem;
}
.room-assignment-page {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  background-color: #f5f5f5;
}

.main-content {
  flex: 1;
  padding: 20px 0;
}

.container {
  max-width: 1200px;
  margin: 0 100px;
  padding: 0 20px;
  
}

.page-header {
  margin-bottom: 30px;
}

.page-header h1 {
  color: #1BBC9B;
  font-size: 1.8rem;
  margin: 0;
}

.no-applications {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 40px;
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0,0,0,0.05);
}

.no-applications i {
  font-size: 3rem;
  color: #1BBC9B;
  margin-bottom: 15px;
}

.no-applications p {
  color: #666;
  font-size: 1.1rem;
  margin: 0;
}

.applications-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(500px, 1fr));
  gap: 150px;
}

.application-card {
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0,0,0,0.05);
  padding: 20px;
  display: flex;
  flex-direction: column;
  width: 600px;
}

.card-header {
  display: flex;
  align-items: center;
  margin-bottom: 15px;
  padding-bottom: 10px;
  border-bottom: 1px solid #eee;
}

.card-header h3 {
  margin: 0;
  font-size: 1.2rem;
  color: #333;
}

.roll-number {
  margin-left: 10px;
  background: #e3f2fd;
  color: #1976d2;
  padding: 3px 8px;
  border-radius: 12px;
  font-size: 0.8rem;
  font-weight: 500;
}

.student-details {
  margin-bottom: 15px;
}

.detail-row {
  display: flex;
  margin-bottom: 8px;
}

.detail-row.full-width {
  flex-direction: column;
}

.detail-item {
  flex: 1;
  display: flex;
}

.detail-label {
  font-weight: 600;
  color: #464343;
  min-width: 100px;
  padding-right: 10px;
}

.detail-value {
  color: #333;
}

.documents {
  display: flex;
  gap: 10px;
  margin: 15px 0;
}

.doc-preview {
  cursor: pointer;
  text-align: center;
  transition: transform 0.2s;
}

.doc-preview:hover {
  transform: scale(1.05);
}

.doc-preview img {
  width: 150px;
  height: 120px;
  object-fit: cover;
  border: 1px solid #ddd;
  border-radius: 4px;
  margin: 10px;
}

.doc-preview span {
  display: block;
  font-size: 0.8rem;
  color: #312f2f;
  margin-top: 5px;
  margin-right: 10px;
  text-align: center;
}

.assignment-controls {
  display: flex;
  align-items: center;
  margin-top: 15px;
  padding-top: 15px;
  border-top: 1px solid #eee;
}

.room-select {
  flex: 1;
  margin-right: 15px;
}

.room-select label {
  display: block;
  font-size: 0.9rem;
  color: #555;
  margin-bottom: 5px;
}

.form-select {
  width: 100%;
  padding: 8px 12px;
  border: 1px solid #ddd;
  border-radius: 4px;
  background: white;
}

.assign-btn {
  background: #1BBC9B;
  color: white;
  border: none;
  padding: 8px 15px;
  border-radius: 4px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 5px;
  transition: background 0.2s;
}

.assign-btn:hover {
  background: #16a085;
}

.assign-btn:disabled {
  background: #cccccc;
  cursor: not-allowed;
}

/* Modal for image preview */
.image-modal {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0,0,0,0.8);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.image-modal-content {
  max-width: 90%;
  max-height: 90%;
}

.image-modal-content img {
  max-width: 100%;
  max-height: 90vh;
  border: 2px solid white;
  border-radius: 4px;
}

@media (max-width: 768px) {
  .applications-grid {
    grid-template-columns: 1fr;
  }
  
  .detail-row {
    flex-direction: column;
  }
  
  .detail-item {
    margin-bottom: 5px;
  }
  
  .assignment-controls {
    flex-direction: column;
    gap: 10px;
  }
  
  .room-select {
    width: 100%;
    margin-right: 0;
  }
  
  .assign-btn {
    width: 100%;
    justify-content: center;
  }
}
</style>