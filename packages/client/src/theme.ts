import { createMuiTheme } from "@material-ui/core";
import { blueGrey, orange } from "@material-ui/core/colors";

const theme = createMuiTheme({
	palette: {
		primary: {
			main: blueGrey["700"],
			dark: blueGrey["800"],
			light: blueGrey["600"]
		},
		secondary: {
			main: orange["500"]
		}
	}
});

export default theme;
