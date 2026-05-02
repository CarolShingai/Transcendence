/**
 * Avatar Type Definition - Usage Guide
 * 
 * OVERVIEW:
 * =========
 * The avatar system uses a numeric index (0-15) to select user avatars.
 * This system maps directly to database values for seamless data binding.
 * 
 * 
 * INDEX MAPPING:
 * ==============
 * 0:  No avatar selected (empty/fallback state)
 * 1:  Profile_00.jpg
 * 2:  Profile_01.jpg
 * 3:  Profile_02.jpg
 * ... continues ...
 * 15: Profile_14.jpg
 * 
 * 
 * USAGE EXAMPLES:
 * ===============
 * 
 * 1. RECEIVING DATA FROM DATABASE:
 * --------------------------------
 * const userFromDatabase = {
 *   id: 123,
 *   name: 'John Doe',
 *   avatarIndex: 5,  ← Database sends as integer
 * };
 * 
 * // Validate and parse the index
 * import { parseAvatarIndexFromDatabase } from '../../constants/profileAvatarTypes';
 * 
 * const validIndex = parseAvatarIndexFromDatabase(userFromDatabase.avatarIndex);
 * // validIndex is now safe integer (5 in this case)
 * 
 * 
 * 2. GETTING THE IMAGE URL:
 * -------------------------
 * import { getAvatarFilename } from '../../constants/profileAvatarTypes';
 * 
 * const filename = getAvatarFilename(5);
 * // Returns: "Profile_04.jpg"
 * 
 * 
 * 3. IN REACT COMPONENTS:
 * -----------------------
 * import { AVATAR_CONFIG, getAvatarFilename, isValidAvatarIndex } from '../../constants/profileAvatarTypes';
 * 
 * const [avatarIndex, setAvatarIndex] = useState(0);
 * 
 * // When receiving from API:
 * const loadUserAvatar = (apiData) => {
 *   if (isValidAvatarIndex(apiData.avatarIndex)) {
 *     setAvatarIndex(apiData.avatarIndex);
 *   }
 * };
 * 
 * // Display the avatar
 * const filename = getAvatarFilename(avatarIndex);
 * 
 * {avatarIndex === AVATAR_CONFIG.NONE ? (
 *   <div className="fallback-initials">{initials}</div>
 * ) : (
 *   <img src={require(`../../assets/profile/${filename}`).default} alt="Avatar" />
 * )}
 * 
 * 
 * 4. API INTEGRATION EXAMPLE:
 * ---------------------------
 * const updateProfileAvatar = async (newAvatarIndex) => {
 *   const response = await fetch('/api/profile/avatar', {
 *     method: 'PUT',
 *     headers: { 'Content-Type': 'application/json' },
 *     body: JSON.stringify({ 
 *       avatarIndex: newAvatarIndex  ← Send as integer
 *     }),
 *   });
 * 
 *   const data = await response.json();
 *   const validIndex = parseAvatarIndexFromDatabase(data.avatarIndex);
 *   setAvatarIndex(validIndex);
 * };
 * 
 * 
 * 5. FORM VALIDATION:
 * -------------------
 * import { AVATAR_CONFIG, isValidAvatarIndex } from '../../constants/profileAvatarTypes';
 * 
 * const handleAvatarSelection = (selectedIndex) => {
 *   if (!isValidAvatarIndex(selectedIndex)) {
 *     console.error(
 *       `Avatar index must be between ${AVATAR_CONFIG.NONE} and ${AVATAR_CONFIG.MAX_INDEX}`
 *     );
 *     return;
 *   }
 *   
 *   setAvatarIndex(selectedIndex);
 * };
 * 
 * 
 * BEST PRACTICES:
 * ===============
 * 
 * ✓ Always use parseAvatarIndexFromDatabase() when receiving data from backend
 * ✓ Use isValidAvatarIndex() for runtime validation
 * ✓ Never hardcode avatar indices in components
 * ✓ Always handle index 0 (no avatar) with a fallback (initials, default icon, etc.)
 * ✓ Use AVATAR_CONFIG constants instead of magic numbers
 * ✓ Use JSDoc comments for IDE autocomplete support
 * 
 * 
 * BENEFITS OF THIS APPROACH:
 * ==========================
 * 
 * - Centralized Logic: All avatar logic in one place
 * - Runtime Validation: parseAvatarIndexFromDatabase() guards the data from DB
 * - Type Safety: JSDoc comments enable IDE autocomplete
 * - Maintainability: Easy to find and update avatar logic
 * - Scalability: Simple to add new avatar management features
 * - Documentation: Self-documenting through JSDoc
 * - Refactoring: Change logic once, works everywhere
 */

