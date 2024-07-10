import { Router } from 'express'
import { addNewCatToUser, deleteCatFromUserProfile, getAllUserCatProfiles, updateCatData } from '../controllers/cats.js'

const router = Router()

router.post('/add-new-user-cat', addNewCatToUser)
router.get('/get-all-users-cat-profiles/:userId', getAllUserCatProfiles)
router.patch('/update-user-cat-profile/:userId/:catId', updateCatData)
router.delete('/delete-user-cat-profile/:userId/:catId', deleteCatFromUserProfile)

export default router
