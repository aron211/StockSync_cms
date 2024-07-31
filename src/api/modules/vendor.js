import axios from 'axios'
import { apiHttp } from '../axiosApi'

async function vendorGetList() {
    const result = await apiHttp('get', '/api/v1/vendors');
    return result
}

// async function usersGet (IdUserLanding) {
//   let result
//   result = await axios.get(
//     'https://as-humedal-api.azurewebsites.net/Users/Get?IdUserLanding=' +
//       IdUserLanding
//   )
//   console.log('GETRESULT: ', result.data.data)
//   return result.data.data
// }

async function createVendor(vendorToCreate) {
    const result = await apiHttp('post', '/api/v1/vendors', vendorToCreate);
    console.log('Vendedor creado: ', result)
    return result
}

async function deleteVendor(id) {
    let result
    result = await apiHttp('delete', '/api/v1/vendors/' + id)
    console.log('Vendedor Eliminado: ', result)
    return result
}


async function updateVendor(id, vendorToUpdate) {
    const result = await apiHttp('patch', '/api/v1/vendors/' + id, vendorToUpdate)
    console.log('Vendedor Actualizado: ', result)
    return result
}


export {
    vendorGetList,
    updateVendor,
    deleteVendor,
    createVendor,
}
