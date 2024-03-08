import axios from 'axios';

export async function RetrieveLocalApi() {
    try {
        const response = await axios.get(`/custom-query/data-objects/?id=e48046c9-0b94-41d2-9ad4-206f1604b821`);
        return response.data[0].ed_api_url; 
    } catch (error) {
        console.error('Error fetching data:', error);
        throw error;
    }
}