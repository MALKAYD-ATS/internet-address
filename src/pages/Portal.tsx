Here's the fixed version with all missing closing brackets and proper formatting:

```javascript
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Edit Profile Modal */}
      <EditProfile
        isOpen={showEditProfile}
        onClose={() => setShowEditProfile(false)}
        profile={profile}
        onProfileUpdate={(updatedProfile) => {
          setProfile(updatedProfile);
          setShowEditProfile(false);
        }}
      />

      {/* Custom Styles for Swiper */}
      <style jsx>{`
        .course-carousel .swiper-pagination {
          position: relative !important;
          margin-top: 2rem !important;
        }
        
        .course-carousel .swiper-pagination-bullet {
          width: 12px !important;
          height: 12px !important;
          margin: 0 6px !important;
        }
        
        .course-card {
          height: 600px;
          display: flex;
          flex-direction: column;
        }
        
        .line-clamp-2 {
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
        
        .line-clamp-3 {
          display: -webkit-box;
          -webkit-line-clamp: 3;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
        
        @media (max-width: 768px) {
          .course-card {
            min-width: 300px;
            height: 550px;
          }
        }
      `}</style>
    </div>
  );
};

export default Portal;
```