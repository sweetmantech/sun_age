import { z } from 'zod';
export declare const domainFrameConfigSchema: z.ZodObject<{
    version: z.ZodUnion<[z.ZodLiteral<"0.0.0">, z.ZodLiteral<"0.0.1">, z.ZodLiteral<"1">, z.ZodLiteral<"next">]>;
    name: z.ZodString;
    iconUrl: z.ZodString;
    homeUrl: z.ZodString;
    /** deprecated, set ogImageUrl instead */
    imageUrl: z.ZodOptional<z.ZodString>;
    /** deprecated, will rely on fc:frame meta tag */
    buttonTitle: z.ZodOptional<z.ZodString>;
    splashImageUrl: z.ZodOptional<z.ZodString>;
    splashBackgroundColor: z.ZodOptional<z.ZodString>;
    webhookUrl: z.ZodOptional<z.ZodString>;
    /** see: https://github.com/farcasterxyz/miniapps/discussions/191 */
    subtitle: z.ZodOptional<z.ZodEffects<z.ZodEffects<z.ZodEffects<z.ZodString, string, string>, string, string>, string, string>>;
    description: z.ZodOptional<z.ZodEffects<z.ZodEffects<z.ZodEffects<z.ZodString, string, string>, string, string>, string, string>>;
    screenshotUrls: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
    primaryCategory: z.ZodOptional<z.ZodEnum<["games", "social", "finance", "utility", "productivity", "health-fitness", "news-media", "music", "shopping", "education", "developer-tools", "entertainment", "art-creativity"]>>;
    tags: z.ZodOptional<z.ZodArray<z.ZodEffects<z.ZodEffects<z.ZodEffects<z.ZodString, string, string>, string, string>, string, string>, "many">>;
    heroImageUrl: z.ZodOptional<z.ZodString>;
    tagline: z.ZodOptional<z.ZodEffects<z.ZodEffects<z.ZodEffects<z.ZodString, string, string>, string, string>, string, string>>;
    ogTitle: z.ZodOptional<z.ZodEffects<z.ZodEffects<z.ZodEffects<z.ZodString, string, string>, string, string>, string, string>>;
    ogDescription: z.ZodOptional<z.ZodEffects<z.ZodEffects<z.ZodEffects<z.ZodString, string, string>, string, string>, string, string>>;
    ogImageUrl: z.ZodOptional<z.ZodString>;
    /** see: https://github.com/farcasterxyz/miniapps/discussions/204 */
    noindex: z.ZodOptional<z.ZodBoolean>;
    /** see https://github.com/farcasterxyz/miniapps/discussions/256 */
    requiredChains: z.ZodOptional<z.ZodArray<z.ZodEnum<[string, ...string[]]>, "many">>;
    requiredCapabilities: z.ZodOptional<z.ZodArray<z.ZodEnum<[string, ...string[]]>, "many">>;
}, "strip", z.ZodTypeAny, {
    name: string;
    version: "1" | "next" | "0.0.0" | "0.0.1";
    iconUrl: string;
    homeUrl: string;
    splashImageUrl?: string | undefined;
    splashBackgroundColor?: string | undefined;
    imageUrl?: string | undefined;
    buttonTitle?: string | undefined;
    webhookUrl?: string | undefined;
    subtitle?: string | undefined;
    description?: string | undefined;
    screenshotUrls?: string[] | undefined;
    primaryCategory?: "games" | "social" | "finance" | "utility" | "productivity" | "health-fitness" | "news-media" | "music" | "shopping" | "education" | "developer-tools" | "entertainment" | "art-creativity" | undefined;
    tags?: string[] | undefined;
    heroImageUrl?: string | undefined;
    tagline?: string | undefined;
    ogTitle?: string | undefined;
    ogDescription?: string | undefined;
    ogImageUrl?: string | undefined;
    noindex?: boolean | undefined;
    requiredChains?: string[] | undefined;
    requiredCapabilities?: string[] | undefined;
}, {
    name: string;
    version: "1" | "next" | "0.0.0" | "0.0.1";
    iconUrl: string;
    homeUrl: string;
    splashImageUrl?: string | undefined;
    splashBackgroundColor?: string | undefined;
    imageUrl?: string | undefined;
    buttonTitle?: string | undefined;
    webhookUrl?: string | undefined;
    subtitle?: string | undefined;
    description?: string | undefined;
    screenshotUrls?: string[] | undefined;
    primaryCategory?: "games" | "social" | "finance" | "utility" | "productivity" | "health-fitness" | "news-media" | "music" | "shopping" | "education" | "developer-tools" | "entertainment" | "art-creativity" | undefined;
    tags?: string[] | undefined;
    heroImageUrl?: string | undefined;
    tagline?: string | undefined;
    ogTitle?: string | undefined;
    ogDescription?: string | undefined;
    ogImageUrl?: string | undefined;
    noindex?: boolean | undefined;
    requiredChains?: string[] | undefined;
    requiredCapabilities?: string[] | undefined;
}>;
export declare const domainManifestSchema: z.ZodObject<{
    accountAssociation: z.ZodObject<{
        header: z.ZodString;
        payload: z.ZodString;
        signature: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        header: string;
        payload: string;
        signature: string;
    }, {
        header: string;
        payload: string;
        signature: string;
    }>;
    frame: z.ZodOptional<z.ZodObject<{
        version: z.ZodUnion<[z.ZodLiteral<"0.0.0">, z.ZodLiteral<"0.0.1">, z.ZodLiteral<"1">, z.ZodLiteral<"next">]>;
        name: z.ZodString;
        iconUrl: z.ZodString;
        homeUrl: z.ZodString;
        /** deprecated, set ogImageUrl instead */
        imageUrl: z.ZodOptional<z.ZodString>;
        /** deprecated, will rely on fc:frame meta tag */
        buttonTitle: z.ZodOptional<z.ZodString>;
        splashImageUrl: z.ZodOptional<z.ZodString>;
        splashBackgroundColor: z.ZodOptional<z.ZodString>;
        webhookUrl: z.ZodOptional<z.ZodString>;
        /** see: https://github.com/farcasterxyz/miniapps/discussions/191 */
        subtitle: z.ZodOptional<z.ZodEffects<z.ZodEffects<z.ZodEffects<z.ZodString, string, string>, string, string>, string, string>>;
        description: z.ZodOptional<z.ZodEffects<z.ZodEffects<z.ZodEffects<z.ZodString, string, string>, string, string>, string, string>>;
        screenshotUrls: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
        primaryCategory: z.ZodOptional<z.ZodEnum<["games", "social", "finance", "utility", "productivity", "health-fitness", "news-media", "music", "shopping", "education", "developer-tools", "entertainment", "art-creativity"]>>;
        tags: z.ZodOptional<z.ZodArray<z.ZodEffects<z.ZodEffects<z.ZodEffects<z.ZodString, string, string>, string, string>, string, string>, "many">>;
        heroImageUrl: z.ZodOptional<z.ZodString>;
        tagline: z.ZodOptional<z.ZodEffects<z.ZodEffects<z.ZodEffects<z.ZodString, string, string>, string, string>, string, string>>;
        ogTitle: z.ZodOptional<z.ZodEffects<z.ZodEffects<z.ZodEffects<z.ZodString, string, string>, string, string>, string, string>>;
        ogDescription: z.ZodOptional<z.ZodEffects<z.ZodEffects<z.ZodEffects<z.ZodString, string, string>, string, string>, string, string>>;
        ogImageUrl: z.ZodOptional<z.ZodString>;
        /** see: https://github.com/farcasterxyz/miniapps/discussions/204 */
        noindex: z.ZodOptional<z.ZodBoolean>;
        /** see https://github.com/farcasterxyz/miniapps/discussions/256 */
        requiredChains: z.ZodOptional<z.ZodArray<z.ZodEnum<[string, ...string[]]>, "many">>;
        requiredCapabilities: z.ZodOptional<z.ZodArray<z.ZodEnum<[string, ...string[]]>, "many">>;
    }, "strip", z.ZodTypeAny, {
        name: string;
        version: "1" | "next" | "0.0.0" | "0.0.1";
        iconUrl: string;
        homeUrl: string;
        splashImageUrl?: string | undefined;
        splashBackgroundColor?: string | undefined;
        imageUrl?: string | undefined;
        buttonTitle?: string | undefined;
        webhookUrl?: string | undefined;
        subtitle?: string | undefined;
        description?: string | undefined;
        screenshotUrls?: string[] | undefined;
        primaryCategory?: "games" | "social" | "finance" | "utility" | "productivity" | "health-fitness" | "news-media" | "music" | "shopping" | "education" | "developer-tools" | "entertainment" | "art-creativity" | undefined;
        tags?: string[] | undefined;
        heroImageUrl?: string | undefined;
        tagline?: string | undefined;
        ogTitle?: string | undefined;
        ogDescription?: string | undefined;
        ogImageUrl?: string | undefined;
        noindex?: boolean | undefined;
        requiredChains?: string[] | undefined;
        requiredCapabilities?: string[] | undefined;
    }, {
        name: string;
        version: "1" | "next" | "0.0.0" | "0.0.1";
        iconUrl: string;
        homeUrl: string;
        splashImageUrl?: string | undefined;
        splashBackgroundColor?: string | undefined;
        imageUrl?: string | undefined;
        buttonTitle?: string | undefined;
        webhookUrl?: string | undefined;
        subtitle?: string | undefined;
        description?: string | undefined;
        screenshotUrls?: string[] | undefined;
        primaryCategory?: "games" | "social" | "finance" | "utility" | "productivity" | "health-fitness" | "news-media" | "music" | "shopping" | "education" | "developer-tools" | "entertainment" | "art-creativity" | undefined;
        tags?: string[] | undefined;
        heroImageUrl?: string | undefined;
        tagline?: string | undefined;
        ogTitle?: string | undefined;
        ogDescription?: string | undefined;
        ogImageUrl?: string | undefined;
        noindex?: boolean | undefined;
        requiredChains?: string[] | undefined;
        requiredCapabilities?: string[] | undefined;
    }>>;
}, "strip", z.ZodTypeAny, {
    accountAssociation: {
        header: string;
        payload: string;
        signature: string;
    };
    frame?: {
        name: string;
        version: "1" | "next" | "0.0.0" | "0.0.1";
        iconUrl: string;
        homeUrl: string;
        splashImageUrl?: string | undefined;
        splashBackgroundColor?: string | undefined;
        imageUrl?: string | undefined;
        buttonTitle?: string | undefined;
        webhookUrl?: string | undefined;
        subtitle?: string | undefined;
        description?: string | undefined;
        screenshotUrls?: string[] | undefined;
        primaryCategory?: "games" | "social" | "finance" | "utility" | "productivity" | "health-fitness" | "news-media" | "music" | "shopping" | "education" | "developer-tools" | "entertainment" | "art-creativity" | undefined;
        tags?: string[] | undefined;
        heroImageUrl?: string | undefined;
        tagline?: string | undefined;
        ogTitle?: string | undefined;
        ogDescription?: string | undefined;
        ogImageUrl?: string | undefined;
        noindex?: boolean | undefined;
        requiredChains?: string[] | undefined;
        requiredCapabilities?: string[] | undefined;
    } | undefined;
}, {
    accountAssociation: {
        header: string;
        payload: string;
        signature: string;
    };
    frame?: {
        name: string;
        version: "1" | "next" | "0.0.0" | "0.0.1";
        iconUrl: string;
        homeUrl: string;
        splashImageUrl?: string | undefined;
        splashBackgroundColor?: string | undefined;
        imageUrl?: string | undefined;
        buttonTitle?: string | undefined;
        webhookUrl?: string | undefined;
        subtitle?: string | undefined;
        description?: string | undefined;
        screenshotUrls?: string[] | undefined;
        primaryCategory?: "games" | "social" | "finance" | "utility" | "productivity" | "health-fitness" | "news-media" | "music" | "shopping" | "education" | "developer-tools" | "entertainment" | "art-creativity" | undefined;
        tags?: string[] | undefined;
        heroImageUrl?: string | undefined;
        tagline?: string | undefined;
        ogTitle?: string | undefined;
        ogDescription?: string | undefined;
        ogImageUrl?: string | undefined;
        noindex?: boolean | undefined;
        requiredChains?: string[] | undefined;
        requiredCapabilities?: string[] | undefined;
    } | undefined;
}>;
