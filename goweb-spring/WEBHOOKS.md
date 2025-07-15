# Webhook Configuration

This document provides information about the webhook configuration for the goweb-spring application.

## Supabase Webhook Setup

### Environment Variables

When configuring the Supabase webhook integration, the following environment variable must be set:

- `SUPABASE_BEFORE_USER_CREATED_SECRET`: The webhook secret key used to verify incoming webhook requests from Supabase.

**Important**: The webhook secret must be provided **WITHOUT** the `v1,whsec_` prefix. The application expects the raw secret value.

### Example

If Supabase provides a webhook secret like:
```
v1,whsec_abcdef123456789
```

You should set the environment variable as:
```
SUPABASE_BEFORE_USER_CREATED_SECRET=abcdef123456789
```

### Webhook Endpoints

The application provides the following webhook endpoints:

- `/api/webhooks/supabase/before-user-created`: Handles user creation events from Supabase

### Webhook Verification

The application uses the StandardWebhooks verification method to validate webhook requests. This requires:

1. A valid webhook signature in the `webhook-signature` header
2. A timestamp in the `webhook-timestamp` header
3. A webhook ID in the `webhook-id` header

The signature is verified using HMAC-SHA256 with the provided secret key. 