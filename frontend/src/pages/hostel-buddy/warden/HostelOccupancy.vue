<template>
  <Navbar_warden />
  <div class="hostel-occupancy-page">
    <div class="main-content">
      <div class="container">
        <div class="page-header">
          <h1>Hostel Occupancy</h1>
        </div>

        <div class="stats-cards">
          <div class="stat-card">
            <div class="stat-content">
              <h3>Total Rooms</h3>
              <p class="stat-value">{{ totalRooms }}</p>
            </div>
            <div class="stat-icon">
              <i class="fas fa-door-closed"></i>
            </div>
          </div>
          <div class="stat-card">
            <div class="stat-content">
              <h3>Occupied</h3>
              <p class="stat-value">{{ occupiedRooms }}</p>
              <p class="stat-percent">{{ occupancyPercentage }}%</p>
            </div>
            <div class="stat-icon">
              <i class="fas fa-user-check"></i>
            </div>
          </div>
          <div class="stat-card">
            <div class="stat-content">
              <h3>Vacant</h3>
              <p class="stat-value">{{ vacantRooms }}</p>
              <p class="stat-percent">{{ vacancyPercentage }}%</p>
            </div>
            <div class="stat-icon">
              <i class="fas fa-bed"></i>
            </div>
          </div>
        </div>

        <div class="heatmap-section">
          <h2>Occupancy Heatmap</h2>
          <div class="heatmap-container">
            <div class="heatmap-legend">
              <div class="legend-item">
                <div class="legend-color vacant"></div>
                <span>Vacant (0%)</span>
              </div>
              <div class="legend-item">
                <div class="legend-color low"></div>
                <span>Low (1-33%)</span>
              </div>
              <div class="legend-item">
                <div class="legend-color medium"></div>
                <span>Medium (34-66%)</span>
              </div>
              <div class="legend-item">
                <div class="legend-color high"></div>
                <span>High (67-99%)</span>
              </div>
              <div class="legend-item">
                <div class="legend-color full"></div>
                <span>Full (100%)</span>
              </div>
            </div>

            <div class="heatmap">
              <div class="floor" v-for="(floorRooms, floor) in groupedRooms" :key="floor">
                <h3>{{ floor }}</h3>
                <div class="rooms-row">
                  <div 
                    v-for="room in floorRooms" 
                    :key="room.roomNo" 
                    class="room" 
                    :class="getOccupancyClass(room)"
                    @click="showRoomDetails(room)"
                  >
                    {{ room.roomNo }}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div class="vacancy-list">
          <h2>Vacancy Status</h2>
          <table>
            <thead>
              <tr>
                <th>Room No</th>
                <th>Building</th>
                <th>Floor</th>
                <th>Capacity</th>
                <th>Occupants</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="room in rooms" :key="room.roomNo">
                <td>{{ room.roomNo }}</td>
                <td>{{ room.block }}</td>
                <td>{{ room.floor }}</td>
                <td>{{ room.capacity }}</td>
                <td>{{ room.occupants.length }}</td>
                <td>
                  <span class="status-badge" :class="getStatusClass(room)">
                    {{ getStatusText(room) }}
                  </span>
                </td>
                <td>
                  <button class="action-btn primary" @click="assignStudent(room.roomNo)">
                    Allocate
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import axios from 'axios';
import Navbar_warden from '../../../components/Navbar_warden.vue'

export default {
  components: { Navbar_warden },
  data() {
    return {
      rooms: [],
      selectedRoom: null,
      showModal: false
    };
  },
  computed: {
    totalRooms() {
      return this.rooms.length;
    },
    occupiedRooms() {
      return this.rooms.filter(room => room.occupants.length > 0).length;
    },
    vacantRooms() {
      return this.totalRooms - this.occupiedRooms;
    },
    occupancyPercentage() {
      return Math.round((this.occupiedRooms / this.totalRooms) * 100);
    },
    vacancyPercentage() {
      return 100 - this.occupancyPercentage;
    },
    groupedRooms() {
      const grouped = {};
      this.rooms.forEach(room => {
        const floor = room.floor;
        if (!grouped[floor]) {
          grouped[floor] = [];
        }
        grouped[floor].push(room);
      });
      return grouped;
    }
  },
  async mounted() {
    await this.fetchRooms();
  },
  methods: {
    async fetchRooms() {
      const res = await axios.get('/api/rooms');
      if (res.data.success) {
        this.rooms = res.data.data;
      }
    },
    getOccupancyClass(room) {
      const occupancyRate = (room.occupants.length / room.capacity) * 100;
      if (occupancyRate === 0) return 'vacant';
      if (occupancyRate <= 33) return 'low';
      if (occupancyRate <= 66) return 'medium';
      if (occupancyRate < 100) return 'high';
      return 'full';
    },
    getStatusClass(room) {
      if (room.occupants.length === 0) return 'vacant';
      if (room.occupants.length < room.capacity) return 'partial';
      return 'full';
    },
    getStatusText(room) {
      if (room.occupants.length === 0) return 'Vacant';
      if (room.occupants.length === room.capacity) return 'Full';
      return `${room.occupants.length}/${room.capacity} Occupied`;
    },
    showRoomDetails(room) {
      this.selectedRoom = room;
      this.showModal = true;
    },
    async assignStudent(roomNo) {
      const studentId = prompt('Enter student ID:');
      if (!studentId) return;
      
      const bedNo = prompt('Enter bed no:');
      if (!bedNo) return;

      try {
        const res = await axios.put(`/api/rooms/assign/${roomNo}`, {
          studentId,
          bedNo
        });
        alert(res.data.message);
        await this.fetchRooms();
      } catch (error) {
        alert(error.response?.data?.message || 'Error assigning student');
      }
    }
  }
};
</script>

<style scoped>
.hostel-occupancy-page {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  color: #333;
}

.main-content {
  flex: 1;
  padding: 20px;
  background-color: #f5f5f5;
}

.container {
  max-width: 1200px;
  margin: 0 auto;
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0,0,0,0.1);
  padding: 20px;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  flex-wrap: wrap;
  gap: 15px;
}

.page-header h1 {
  margin: 0;
  color: #1BBC9B;
  font-size: 1.8rem;
}

.stats-cards {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 15px;
  margin-bottom: 30px;
}

.stat-card {
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
  padding: 15px;
  display: flex;
  justify-content: space-between;
  border-top: 4px solid #1BBC9B;
}

.stat-content h3 {
  margin: 0 0 5px 0;
  font-size: 1rem;
  color: #555;
}

.stat-value {
  font-size: 1.8rem;
  font-weight: 600;
  margin: 0;
  color: #1BBC9B;
}

.stat-percent {
  margin: 5px 0 0;
  font-size: 0.9rem;
  color: #666;
}

.stat-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 50px;
  color: #1BBC9B;
  font-size: 1.8rem;
}

.heatmap-section {
  margin-bottom: 30px;
}

.heatmap-section h2 {
  color: #1BBC9B;
  margin-bottom: 15px;
}

.heatmap-container {
  border: 1px solid #eee;
  border-radius: 8px;
  padding: 15px;
}

.heatmap-legend {
  display: flex;
  justify-content: center;
  gap: 20px;
  margin-bottom: 15px;
  flex-wrap: wrap;
}

.legend-item {
  display: flex;
  align-items: center;
  gap: 5px;
  font-size: 0.9rem;
}

.legend-color {
  width: 20px;
  height: 20px;
  border-radius: 4px;
}

.legend-color.vacant {
  background-color: #e3f2fd;
  border: 1px solid #bbdefb;
}

.legend-color.low {
  background-color: #c8e6c9;
  border: 1px solid #a5d6a7;
}

.legend-color.medium {
  background-color: #fff9c4;
  border: 1px solid #fff59d;
}

.legend-color.high {
  background-color: #ffcc80;
  border: 1px solid #ffb74d;
}

.legend-color.full {
  background-color: #ef9a9a;
  border: 1px solid #e57373;
}

.heatmap {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.floor {
  background: #f9f9f9;
  padding: 15px;
  border-radius: 8px;
}

.floor h3 {
  margin: 0 0 10px 0;
  color: #555;
}

.rooms-row {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

.room {
  width: 50px;
  height: 50px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 4px;
  cursor: pointer;
  font-weight: 500;
  transition: transform 0.2s;
}

.room:hover {
  transform: scale(1.1);
}

.room.vacant {
  background-color: #e3f2fd;
  border: 1px solid #bbdefb;
  color: #1976d2;
}

.room.low {
  background-color: #c8e6c9;
  border: 1px solid #a5d6a7;
  color: #2e7d32;
}

.room.medium {
  background-color: #fff9c4;
  border: 1px solid #fff59d;
  color: #f57f17;
}

.room.high {
  background-color: #ffcc80;
  border: 1px solid #ffb74d;
  color: #e65100;
}

.room.full {
  background-color: #ef9a9a;
  border: 1px solid #e57373;
  color: #c62828;
}

.vacancy-list {
  margin-top: 30px;
}

.vacancy-list h2 {
  color: #1BBC9B;
  margin-bottom: 15px;
}

table {
  width: 100%;
  border-collapse: collapse;
}

th, td {
  padding: 12px 15px;
  text-align: left;
  border-bottom: 1px solid #eee;
}

th {
  background-color: #f5f5f5;
  font-weight: 600;
  color: #555;
}

.status-badge {
  padding: 4px 8px;
  border-radius: 12px;
  font-size: 0.85rem;
  font-weight: 500;
}

.status-badge.vacant {
  background-color: #e3f2fd;
  color: #1976d2;
}

.status-badge.partial {
  background-color: #fff3e0;
  color: #e65100;
}

.status-badge.full {
  background-color: #e8f5e9;
  color: #2e7d32;
}

.action-btn {
  padding: 6px 12px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 0.85rem;
  transition: background 0.2s;
}

.action-btn.primary {
  background-color: #1BBC9B;
  color: white;
}

.action-btn.primary:hover {
  background-color: #16a085;
}

@media (max-width: 768px) {
  .page-header {
    flex-direction: column;
    align-items: flex-start;
  }
  
  .heatmap-legend {
    flex-direction: column;
    align-items: flex-start;
    gap: 8px;
  }
  
  .room {
    width: 40px;
    height: 40px;
    font-size: 0.8rem;
  }
  
  th, td {
    padding: 8px 10px;
    font-size: 0.85rem;
  }
}
</style>