import React, { useCallback, useState } from "react";
import Button from "@mui/material/Button";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";
import Radio from "@mui/material/Radio";
import RadioGroup from "@mui/material/RadioGroup";
import FormControlLabel from "@mui/material/FormControlLabel";
import { SendRequest } from "../../util/AxiosUtil";

const UpdaingMembershipModal = (props) => {
  const [option, setOption] = useState(0);
  const handleClose = useCallback(() => {
    props.setOpen(false);
  }, [props]);

  const handleOK = useCallback(() => {
    //Paypal Integration Code here

    SendRequest({
      url: "MembershipManage/_UpdateMembership",
      method: "POST",
      data: {
        MembershipPlanId: props.membership.PlanId,
        BillingPeriod: option,
      },
    }).then(props.purchaseFeedback);
    props.setOpen(false);
  }, [props, option]);

  return (
    <Dialog
      open={props.open}
      keepMounted
      onClose={handleClose}
      aria-describedby="alert-dialog-slide-description"
    >
      <DialogTitle>
        Update Membership Plan To <b>{props.membership.Name}</b>
      </DialogTitle>
      <DialogContent>
        <RadioGroup
          aria-labelledby="demo-radio-buttons-group-label"
          defaultValue="female"
          name="radio-buttons-group"
          value={option}
          onChange={(ev, value) => setOption(value)}
        >
          <FormControlLabel value={0} control={<Radio />} label="Monthly" />
          <FormControlLabel value={1} control={<Radio />} label="Annual" />
        </RadioGroup>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleOK}>Ok</Button>
      </DialogActions>
    </Dialog>
  );
};

export default UpdaingMembershipModal;
