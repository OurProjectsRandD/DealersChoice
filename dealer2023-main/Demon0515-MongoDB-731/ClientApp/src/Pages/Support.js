import { Grid } from "@mui/material";
import React from "react";
import Accordion from "@mui/material/Accordion";
import AccordionSummary from "@mui/material/AccordionSummary";
import AccordionDetails from "@mui/material/AccordionDetails";
import Typography from "@mui/material/Typography";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";

const FAQs = [
  {
    Summary: "How do I host a poker game?",
    Details: "",
  },
  {
    Summary: "Question 2",
    Details: "This is the FAQ Question Answer",
  },
];

const Support = () => {
  return (
    <Grid container>
      <Grid item xs={7}>
        {FAQs.map((faq) => (
          <Accordion>
            <AccordionSummary
              expandIcon={<ExpandMoreIcon />}
              aria-controls="panel1a-content"
              id="panel1a-header"
            >
              <Typography>{faq.Summary}</Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Typography>{faq.Details}</Typography>
            </AccordionDetails>
          </Accordion>
        ))}
      </Grid>
      <Grid item xs={4} ml={3}>
        <Typography variant="h4" component="div" sx={{ mr: 2 }}>
          Contact Info
        </Typography>
      </Grid>
    </Grid>
  );
};

export default Support;
