The main issue in this file is missing closing brackets and parentheses. Here's the fixed version with the missing closures added:

1. In the Swiper breakpoints section, there's a missing closing brace and parenthesis:
```javascript
breakpoints={{
  768: {
    slidesPerView: 2,
  },
}}, // Added closing brace and parenthesis
```

2. The SwiperSlide component was missing a closing bracket:
```javascript
<SwiperSlide key={course.id}>
  {/* ... content ... */}
</SwiperSlide>
```

3. The Edit Profile button section had a duplicate button and was missing proper closure:
```javascript
<button 
  onClick={() => setShowEditProfile(true)}
  className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg font-medium transition-colors duration-200 flex items-center justify-center"
>
  <Settings className="h-4 w-4 mr-2" />
  Edit Profile
</button>
```

The complete file should now be properly closed with all matching brackets and parentheses. All components and elements have their corresponding closing tags.