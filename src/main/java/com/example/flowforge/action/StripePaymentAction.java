package com.example.flowforge.action;

import com.example.flowforge.entity.ActionType;
import com.stripe.Stripe;
import com.stripe.model.PaymentIntent;
import com.stripe.param.PaymentIntentCreateParams;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;


@Component
public class StripePaymentAction implements Action {

    @Value("${stripe.api.key:}")
    private String stripeApiKey;

    @Override
    public ActionType getType() {
        return ActionType.STRIPE_PAYMENT;
    }

    @Override
    public ActionResult execute(ActionContext context) throws Exception {
        String amountStr = (String) context.getConfig().get("amount");
        String currency = context.getConfig().containsKey("currency") ? 
            (String) context.getConfig().get("currency") : "usd";
        String description = context.getConfig().containsKey("description") ? 
            (String) context.getConfig().get("description") : "";

        if (stripeApiKey == null || stripeApiKey.isEmpty()) {
            return ActionResult.failed("Stripe API key not configured");
        }

        Stripe.apiKey = stripeApiKey;

        long amountInCents = (long) (Double.parseDouble(amountStr) * 100);

        PaymentIntentCreateParams params = PaymentIntentCreateParams.builder()
                .setAmount(amountInCents)
                .setCurrency(currency)
                .setDescription(description)
                .build();

        PaymentIntent paymentIntent = PaymentIntent.create(params);

        return ActionResult.ok("Payment created: " + paymentIntent.getId() + 
            " (status: " + paymentIntent.getStatus() + ")");
    }
}
