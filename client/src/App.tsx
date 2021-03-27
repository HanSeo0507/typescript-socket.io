import React, { useEffect } from "react";
import { GlobalStyle } from "src/components";

import { Main } from "src/pages";

const App: React.FC = () => {
	return (
		<>
			<GlobalStyle />

			<Main />
		</>
	);
};

export default App;
