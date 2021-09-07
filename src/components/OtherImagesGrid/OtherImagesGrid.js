import React from 'react';
import { ResponsiveImage } from '..';

import css from './OtherImagesGrid.module.css';

const OtherImagesGrid = (props) => {
  const { otherImages, onClick, title } = props
  return (
    <div className={css.container}>
      {otherImages.map((image, index) => {
        return <ResponsiveImage
          key={image.id.uuid}
          className={css.responsiveImageItem}
          onClick={(e) => onClick(e, index)}
          alt={`${title} ${index}`}
          image={image}
          variants={[
            'landscape-crop',
            'landscape-crop2x',
            'landscape-crop4x',
            'landscape-crop6x',
          ]}
        />
      })}

      {/* a space filler that acts as a last item on the last row, so that 
      space-between does not spread the spaces between other items on the row */}
      <div className={css.spaceFiller}></div>

    </div>
  );
}

export default OtherImagesGrid;