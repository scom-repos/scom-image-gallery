import { Styles } from '@ijstech/components';
const Theme = Styles.Theme.ThemeVars;

export const modalStyle = Styles.style({
  $nest: {
    '.hovered-icon': {
      transition: 'background 0.2s ease-in-out',
      $nest: {
        '&:hover': {
          background: `${Theme.action.hoverBackground} !important`
        }
      }
    }
  }
})

export const gridStyle = Styles.style({
  $nest: {
  }
})
