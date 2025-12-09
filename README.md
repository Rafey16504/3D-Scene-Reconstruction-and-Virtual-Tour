# 3D Scene Reconstruction and Virtual Tour

A project demonstrating 3D reconstruction from photographs and interactive web-based 3D visualization using computer vision and web technologies.

**Authors**: Abdul Rafey and Abdul Hadi

## Project Overview

This project captures photographs of an indoor scene and reconstructs a 3D point cloud, which is then visualized in an interactive web-based application. The workflow demonstrates:

1. **3D Reconstruction**: Attempted Structure from Motion implementation followed by professional photogrammetry using Agisoft MetaShape
2. **Iterative Improvement**: Capturing additional images to achieve higher-quality reconstruction
3. **Interactive Visualization**: Web-based 3D viewer using Three.js with mouse and keyboard controls

## Project Structure

```
.
├── data/                           # Original photograph dataset
├── models/                         # 3D model files
├── threejs_room_app/              # Web application for 3D visualization
│   ├── server.js                  # Express.js server
│   ├── package.json               # Node.js dependencies
│   └── public/
│       ├── app.js                 # Three.js application code
│       ├── index.html             # Web page
│       └── cameras/               # Camera configuration (JSON)
├── weekly_deliverables/ 
│   ├── 26100077_26100075_Week1.ipynb  # Week 1: Initial exploration
│   ├── 26100077_26100075_Week2.ipynb  # Week 2: SfM implementation
│   ├── 26100077_26100075_Week3.ipynb  # Week 3: Refinement with MetaShape
    ├── two_view_cloud.ply             # Point cloud from initial 
├── final_Report/                  # Project report (LaTeX)reconstruction
└── README.md                      
```

## Methodology

### Stage 1: Initial Structure from Motion (SfM)
We implemented a basic 3D reconstruction pipeline:
- **Feature Detection**: SIFT keypoint detection
- **Feature Matching**: FLANN-based matching with Lowe's ratio test
- **Essential Matrix**: RANSAC estimation of camera geometry
- **Camera Pose**: Extraction of rotation and translation
- **Triangulation**: 3D point computation from matched features

**Result**: Sparse, low-quality point cloud with gaps and inconsistencies

### Stage 2: Professional Photogrammetry
Switched to Agisoft MetaShape for better reconstruction:
- Simultaneous multi-image processing
- Automatic bundle adjustment
- Outlier filtering and refinement
- Dense point cloud generation

**Result**: Significantly improved point cloud quality

### Stage 3: Expanded Image Capture
Captured additional photographs from diverse viewpoints and reprocessed all images with MetaShape:
- Better scene coverage
- More redundancy for error filtering
- Higher point cloud density and consistency

**Final Result**: High-quality point cloud suitable for visualization

## Virtual Tour Application

### Technology Stack
- **Frontend**: Three.js (WebGL-based 3D rendering), HTML5
- **Backend**: Express.js (Node.js web server)
- **Data Format**: PLY (Point Cloud Library) files

### Features
- Real-time 3D point cloud rendering
- Interactive camera controls:
  - **Mouse drag**: Rotate view
  - **Mouse scroll**: Zoom in/out
  - **Keyboard**: Additional navigation
- Responsive interaction on desktop systems

### Running the Application

#### Prerequisites
- Node.js (v14 or later)
- npm

#### Installation and Startup
```bash
cd threejs_room_app

npm install

npm start

http://localhost:3000
```

The application will display the 3D point cloud with controls overlaid on the screen.

## Notebooks

Three Jupyter notebooks document the weekly progress:

- **Week 1**: Image loading, feature detection exploration
- **Week 2**: SfM pipeline implementation and two-view reconstruction
- **Week 3**: MetaShape integration, visualization with Open3D and Three.js

## Final Report

A comprehensive LaTeX report is included in `Final_Report/` documenting:
- Methodology and theoretical background
- Implementation details
- Results and visualization
- Discussion of lessons learned
- Limitations and conclusions

## Key Learnings

1. **Professional Tools Matter**: Agisoft MetaShape significantly outperformed basic SfM implementation
2. **More Data Helps**: Capturing additional images from diverse viewpoints improved reconstruction quality
3. **Coverage is Critical**: Scene coverage and camera baseline affect reconstruction success
4. **Web Visualization is Practical**: Three.js enables accessible 3D visualization in web browsers

## Limitations

- Application developed and tested on desktop systems only
- No formal user testing or evaluation performed
- Reconstruction quality depends heavily on image capture and diversity
- Limited to static scene reconstruction (no dynamic objects)

## References

- SIFT: Lowe, D. G. (2004). "Distinctive Image Features from Scale-Invariant Keypoints"
- Essential Matrix: Hartley, R., & Zisserman, A. (2003). "Multiple View Geometry in Computer Vision"
- Three.js: https://threejs.org/
- Agisoft MetaShape: https://www.agisoft.com/

## Repository

- **GitHub**: https://github.com/Rafey16504/3D-Scene-Reconstruction-and-Virtual-Tour

## Contact

For questions or feedback, please contact:
- Abdul Rafey: abdulrafey16504@gmail.com
- Abdul Hadi: 26100075@lums.edu.pk
