import React, { useCallback, useState } from "react";
import Button from "@mui/material/Button";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";
import Radio from "@mui/material/Radio";
import RadioGroup from "@mui/material/RadioGroup";
import FormControlLabel from "@mui/material/FormControlLabel";
import { exportAsImage } from "../../util/Html2CanvasUtil";

const TakePictureOptionModal = (props) => {
  const [option, setOption] = useState(0);
  const handleClose = useCallback(() => {
    props.setOpen(false);
  }, [props]);

  const handleOK = useCallback(() => {
    exportAsImage(document.getElementById("currentPlayer"), "test");
    props.setOpen(false);
  }, [props, option]);

  return (
    <Dialog
      open={props.open}
      keepMounted
      onClose={handleClose}
      aria-describedby="alert-dialog-slide-description"
    >
      <DialogTitle>{"Dialog"}</DialogTitle>
      <DialogContent>
        <RadioGroup
          aria-labelledby="demo-radio-buttons-group-label"
          defaultValue="female"
          name="radio-buttons-group"
          value={option}
          onChange={(ev, value) => setOption(value)}
        >
          <FormControlLabel value={0} control={<Radio />} label="Player Box" />
          <FormControlLabel
            value={1}
            control={<Radio />}
            label="Side By Side"
          />
        </RadioGroup>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleOK}>Ok</Button>
      </DialogActions>
    </Dialog>
  );
};

export default TakePictureOptionModal;
