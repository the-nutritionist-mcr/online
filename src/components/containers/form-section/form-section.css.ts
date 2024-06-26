import { style } from '@vanilla-extract/css';

export const gridContainer = style({
  display: 'grid',
  gridTemplateColumns: '15rem 15rem',
  gridColumnGap: '1rem',
  gridRowGap: '1rem',
  marginBottom: '2.2rem',

  '@media': {
    'screen and (max-width: 899px)': {
      display: 'flex',
      flexDirection: 'column',
    },
  },
});

export const withIcon = style({
  paddingTop: '1.2rem',
});

export const sectionContainer = style({
  display: 'block',
  position: 'relative',
  width: '100%',
  marginTop: '2rem'
});

export const sectionContents = style({
  borderTop: '1px dashed #b8b8b8',
  width: '100%',
  paddingTop: '1rem',
  display: 'flex',
  '@media': {
    'screen and (max-width: 899px)': {
      flexDirection: 'column-reverse',
    },
  },
});

export const iconContainer = style({
  display: 'flex',
  gap: '1rem',
  paddingTop: '2.8rem',
  paddingLeft: '10rem',
  '@media': {
    'screen and (max-width: 899px)': {
      paddingTop: '0',
      position: 'absolute',
      right: '1rem',
    },
  },
});

export const header = style({
  fontSize: '2rem',
  marginBottom: '1rem',
  fontFamily: "'acumin-pro', Arial, sans-serif",
  fontWeight: 700,
});
