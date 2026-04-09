"use client";

import { Box, Container, Paper, Typography } from "@mui/material";

export default function MyAccountPage() {
	return (
		<Container maxWidth="lg" sx={{ py: 4 }}>
			<Paper elevation={0} sx={{ p: 3, borderRadius: 3, border: "1px solid #dde4f1", boxShadow: "none", background: "rgba(255,255,255,0.92)" }}>
				<Box sx={{ display: "grid", gap: 1 }}>
					<Typography variant="h4" sx={{ fontWeight: 800, letterSpacing: "-0.03em" }}>
						Hesabım
					</Typography>
					<Typography sx={{ color: "#5b6b87" }}>
						Bu sayfada hesabınızla ilgili bilgileri görüntüleyebilir ve düzenleyebilirsiniz.
					</Typography>
				</Box>
			</Paper>
		</Container>
	);
}
