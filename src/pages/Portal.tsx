The main issue in this file is a misplaced `useEffect` hook and some missing closing brackets. Here's the fixed version of the problematic section:

```javascript
  // Clear enrollment message after 5 seconds
  useEffect(() => {
    if (enrollmentMessage) {
      const timer = setTimeout(() => {
        setEnrollmentMessage(null);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [enrollmentMessage]);

  const handleEditProfile = () => {
    setIsEditingProfile(true);
  };

  const handleCancelEdit = () => {
    setIsEditingProfile(false);
    if (profile) {
      setEditProfileData({
        full_name: profile.full_name,
        phone_number: profile.phone_number || ''
      });
    }
  };

  const handleProfileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setEditProfileData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSaveProfile = async () => {
    if (!user || !profile) return;

    setIsUpdatingProfile(true);
    try {
      const { data, error } = await supabase
        .from('students')
        .update({
          full_name: editProfileData.full_name,
          phone_number: editProfileData.phone_number
        })
        .eq('id', user.id)
        .select()
        .single();

      if (error) {
        console.error('Error updating profile:', error);
        // Show error message but don't prevent UI update
      } else {
        setProfile(data);
      }
      
      setIsEditingProfile(false);
    } catch (err) {
      console.error('Profile update error:', err);
      setIsEditingProfile(false);
    } finally {
      setIsUpdatingProfile(false);
    }
  };
```

The main fixes were:
1. Moving the closing bracket of the `useEffect` hook to the correct position
2. Adding proper closing brackets for the `handleSaveProfile` function
3. Fixing the indentation and structure of the code

The rest of the file appears to be properly structured and closed.